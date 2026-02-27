+++
title = "We Are Standardizing on AOT for All Console Software"
date = 2026-02-28
description = "Why Repass Cloud has standardized on Native AOT for all internal CLI and distributed console tooling, covering runtime mechanics, memory behavior, musl considerations, and real-world migration trade-offs."
draft = false
showTableOfContents = true
type = "post"
tags = [
  "dotnet",
  "aot",
  "nativeaot",
  "cli",
  "devops",
  "containers",
  "linux",
  "musl",
  "systems",
  "performance",
  "backend",
  "engineering"
]
categories = [
  "Engineering",
  "Runtime",
  "DevOps"
]
authors = ["Repass Cloud"]
+++

## We Are Standardizing on AOT for All Console Software

We’ve moved every internal CLI and distributed console utility at Repass Cloud to native Ahead-of-Time compilation. Not as an experiment. Not for benchmarks in a slide deck. As a default.

If it’s a console binary, it ships as AOT.

This wasn’t ideological. It was operational. Once you run enough short-lived processes across CI runners, containers, cron hosts, and ephemeral environments, the cost of pretending the JIT is “free” becomes visible.

It isn’t free. It never was.

## What Actually Changes When You Remove the JIT

From a systems perspective, the JIT is a runtime compiler bolted into your process. IL is loaded, metadata tables are walked, type loaders activate, generic instantiations are resolved, and machine code is emitted into executable memory pages on demand. Tiered compilation may recompile hot paths. The runtime tracks method bodies, stubs, trampolines, and patchpoints.

That machinery disappears in AOT.

When you publish with NativeAOT, there is no runtime compiler inside the process. No method body emission. No IL-to-native translation at startup. No runtime code generation infrastructure waiting behind a callsite.

The executable you ship already contains machine code for every reachable method body. Generics are materialized ahead of time. Interface dispatch stubs are generated at build time. The dependency graph is resolved statically.

The startup path changes immediately.

With JIT:

- The loader maps the runtime.
- CoreCLR initializes subsystems.
- Metadata tables are parsed.
- Type initialization triggers.
- Methods are compiled on first use.
- Tiered recompilation may kick in.

With AOT:

- The OS loader maps a native binary.
- The runtime initializes minimal services.
- Execution begins.

There is still a runtime. You still have GC. You still have type safety. You still have exception handling. But the compiler is gone.

And when the compiler is gone, so are a lot of invisible costs.

## Startup Mechanics in Practice

On a JIT build, even trivial tools have measurable startup overhead. The first invocation is almost always slower due to cold compilation. In short-lived CLI tools, you rarely hit steady state.

In CI pipelines, you often execute dozens or hundreds of short processes. Each invocation pays the startup tax. In containerized jobs, the container lifecycle amplifies that cost.

With AOT, the process is native from the moment it begins execution. There is no IL warmup. No method body generation. No tiered compilation.

The difference is not theoretical. On our internal utilities, cold startup dropped from ~60–120 ms to low single-digit milliseconds on Linux. In CI runners under load, it matters.

Short-lived processes don’t benefit from JIT optimization tiers. They die before tier 1 code matters. AOT gives you stable startup cost every time.

## Memory Layout and Runtime Services

Removing the JIT changes memory behavior in subtle ways.

JIT processes allocate executable memory pages for generated code. They maintain data structures for method tables, runtime helpers, and tiered compilation bookkeeping. They often have larger resident sets due to runtime compilation state.

AOT binaries contain precompiled native code. There is no runtime code emission. Executable pages are fixed. There is no IL image to keep around for execution. The metadata footprint is trimmed aggressively because the linker removes unreachable types and methods.

You still have:

- Garbage collection
- Exception handling
- Threading
- Basic runtime type information

You do not have:

- Dynamic method generation
- Runtime IL emission
- Unbounded reflection access
- Implicit generic instantiation at runtime

This matters in container environments. Smaller working sets mean denser scheduling. Less runtime variability means more predictable behavior under memory pressure.

## Why AOT Is Better for CLI and Distributed Tooling

Short-lived CLI tools benefit immediately. There is no warmup phase. There is no “first call penalty.” Execution is deterministic. Startup cost becomes negligible.

CI/CD runners benefit even more. Pipelines spawn processes constantly. Native AOT reduces aggregate runtime overhead across the entire pipeline. On ephemeral runners, startup cost is paid every single time.

Scheduled tasks behave better. Cron jobs that run every minute don’t accumulate startup overhead over time. AOT makes them behave like static binaries rather than managed runtimes.

Containerized workloads are a natural fit. Smaller images. Faster startup. No runtime JIT variability. In minimal Linux images, AOT binaries behave like Go binaries in terms of operational profile, while retaining .NET ergonomics.

Distributed binaries are easier to reason about. When you ship a single-file native executable, there is no runtime dependency surprise. No matching runtime required on the host. No “works on my machine” due to JIT differences.

This is where AOT stops being a performance tweak and becomes an operational simplification.

## What You Give Up

You give up laziness.

Reflection that used to “just work” stops working. The linker removes unused metadata aggressively. If a serializer depends on discovering types dynamically without annotations, it breaks.

System.Text.Json with source generation becomes mandatory in many cases. Reflection-based serializers need configuration. Activator.CreateInstance with arbitrary types becomes unsafe unless those types are rooted.

Trimming becomes real. The linker removes code it believes is unreachable. If your application uses indirect references that the static analyzer cannot see, they vanish. Suddenly your code compiles but crashes at runtime with missing metadata exceptions.

Dynamic code generation is gone. Expression.Compile works differently. Anything that relies on runtime IL emission is constrained or unsupported.

Some libraries simply are not compatible. Many older libraries assume full reflection access. Some ORMs rely on dynamic proxy generation. Certain DI containers lean heavily on reflection and runtime code emission.

The ecosystem is improving, but it is not universal.

You trade runtime flexibility for build-time determinism.

For CLI software, that trade is acceptable.

## Migration in Reality

The project file change is straightforward:

```xml
<PropertyGroup>
  <PublishAot>true</PublishAot>
  <SelfContained>true</SelfContained>
  <InvariantGlobalization>true</InvariantGlobalization>
</PropertyGroup>
```

That is the easy part.

The refactors begin immediately.

The first breakpoints are usually:

- Reflection-based serializers
- Generic type discovery patterns
- Implicit assembly scanning
- Third-party libraries assuming dynamic loading

Dependency injection configurations often need explicit registration. Assembly scanning for handlers or services must be replaced with compile-time registration or source generators.

System.Text.Json should be switched to source generation:

```csharp
[JsonSerializable(typeof(MyType))]
[JsonSourceGenerationOptions(WriteIndented = false)]
internal partial class AppJsonContext : JsonSerializerContext
{
}
```

Then use `AppJsonContext.Default.MyType`.

If you do not do this, trimming will remove metadata and your serialization will fail at runtime.

Expect linker warnings. Do not ignore them. Treat them as compile errors. The warnings are telling you which code paths the linker cannot reason about.

Debugging AOT failures is different. When something breaks, it usually breaks early and loudly. Missing metadata exceptions. Type load failures. Serialization errors.

The process is iterative:

- Enable AOT.
- Fix linker warnings.
- Replace dynamic patterns.
- Remove runtime code generation.
- Validate on target runtime.

What usually breaks first is reflection. What breaks second is libraries.

If your codebase relies heavily on dynamic plugin loading, AOT is not the right tool. For static CLI utilities with fixed dependency graphs, it works extremely well.

## Publishing Commands We Use

For Windows x64:

```bash
dotnet publish -c Release -r win-x64 -p:PublishAot=true --self-contained true
```

For Linux x64 (glibc):

```bash
dotnet publish -c Release -r linux-x64 -p:PublishAot=true --self-contained true
```

For Linux musl (Alpine):

```bash
dotnet publish -c Release -r linux-musl-x64 -p:PublishAot=true --self-contained true
```

For a fully optimized production build:

```bash
dotnet publish -c Release \
  -r linux-x64 \
  -p:PublishAot=true \
  -p:StripSymbols=true \
  -p:InvariantGlobalization=true \
  -p:DebuggerSupport=false \
  -p:EnableUnsafeBinaryFormatterSerialization=false \
  --self-contained true
```

These builds produce single native executables. No runtime installation required. No shared framework dependency.

## musl Is Not glibc

If you have only ever deployed against glibc-based distributions, musl feels slightly off at first.

glibc is large, feature-rich, and deeply integrated with many Linux distributions. musl is minimal and designed for static linking and predictable behavior.

When you publish for `linux-musl-x64`, you are targeting environments like Alpine. The C runtime behaves differently in subtle ways:

- DNS resolution can behave differently under load.
- Thread stack sizes may differ.
- Error reporting semantics are not always identical.
- Some edge-case locale behavior changes.

Static linking is more natural under musl. You can produce highly self-contained binaries that run in extremely minimal containers. That’s attractive for scratch-like images.

But there are trade-offs.

Globalization support is often limited unless you bundle ICU. If you rely on culture-specific formatting, collation, or normalization, you must be explicit. Setting `<InvariantGlobalization>true</InvariantGlobalization>` removes ICU dependency but also removes culture-aware behavior.

TLS can behave differently depending on how OpenSSL is linked in the container. In some cases, certificate chains behave unexpectedly in minimal images.

musl sometimes “feels weird” because it is strict and minimal. glibc smooths over more cases. musl exposes them.

When is musl the right call?

- Minimal Alpine containers
- Fully static deployments
- Security-hardened minimal environments
- Situations where image size matters

When is it not?

- Heavy globalization requirements
- Legacy library dependencies expecting glibc
- Environments where subtle libc differences are unacceptable

We use musl deliberately in minimal container images. For broader Linux compatibility, we target `linux-x64`.

## What Stays

AOT does not turn .NET into C. You still have:

- Generics
- Async/await
- GC
- Memory safety
- Span and high-performance primitives
- Cross-platform consistency

You are not writing unmanaged code. You are just removing runtime compilation.

The mental model shifts. Instead of “the runtime will figure it out,” you assume “the compiler must know everything.”

That constraint improves architecture. It forces explicit dependencies. It discourages dynamic scanning and implicit wiring.

For console software, that discipline is beneficial.

## The Operational Result

Our CLI utilities are now:

- Faster to start
- Smaller to ship
- Deterministic in behavior
- Easier to deploy into minimal containers
- Free from runtime version alignment issues

CI runners are measurably leaner. Container cold starts are reduced. Cron hosts behave predictably.

The migration was not trivial, but it was controlled. Reflection was reduced. Serialization was made explicit. Dependencies were audited. Some libraries were replaced.

The end state is simpler.

We no longer treat JIT as the default for short-lived tooling. For long-running services with dynamic behavior requirements, JIT still makes sense. For internal tools and distributed CLI binaries, it does not.

AOT is now the baseline.

All new console software at Repass Cloud is compiled ahead of time by default.
