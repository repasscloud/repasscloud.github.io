---
title: "Export Microsoft 365 Mailboxes, Aliases, and Sizes with PowerShell"
description: "A practical guide to connecting to Exchange Online via PowerShell and exporting a complete mailbox report including primary addresses, aliases, mailbox types, sizes, and item counts to CSV."
pubDate: 2026-03-06
tags:
  - "powershell"
  - "microsoft 365"
  - "exchange online"
  - "office 365"
  - "mailbox management"
  - "entra id"
  - "identity management"
  - "IT administration"
  - "exchange online management"
  - "email administration"
  - "csv export"
  - "alias management"
  - "windows administration"
---

## Overview

If you need a complete picture of your Microsoft 365 mailboxes — primary addresses, aliases, mailbox types, sizes, and item counts — Exchange Online PowerShell gives you everything in one place. This guide walks through connecting to Exchange Online, querying mailbox data, and producing a clean CSV export you can open directly in Excel, Google Sheets, or LibreOffice.

This is the kind of task that comes up regularly in identity audits, mailbox consolidation projects, licence reviews, and migration planning.

## Install the Exchange Online Module

Run this once on the machine you will use to connect. If prompted to trust PSGallery, accept.

```powershell
Install-Module ExchangeOnlineManagement -Scope CurrentUser
```

## Connect to Exchange Online

```powershell
Import-Module ExchangeOnlineManagement
Connect-ExchangeOnline
```

A Microsoft login window will open. Sign in with a Global Admin or Exchange Admin account.

## Query All Mailboxes

The core mailbox data comes from `Get-EXOMailbox`. The `EmailAddresses` property contains all addresses for a mailbox — the primary SMTP address is prefixed with `SMTP:` (uppercase), and aliases are prefixed with `smtp:` (lowercase).

```powershell
Get-EXOMailbox -ResultSize Unlimited |
Select-Object `
    DisplayName,
    UserPrincipalName,
    PrimarySmtpAddress,
    RecipientTypeDetails,
    EmailAddresses
```

| Field | Meaning |
| --- | --- |
| DisplayName | Mailbox display name |
| UserPrincipalName | Login email / UPN |
| PrimarySmtpAddress | Primary mailbox address |
| RecipientTypeDetails | Mailbox type |
| EmailAddresses | All addresses including aliases |

## Mailbox Types You Will Encounter

| Type | Meaning |
| --- | --- |
| UserMailbox | Standard user mailbox |
| SharedMailbox | Shared mailbox |
| RoomMailbox | Meeting room resource |
| EquipmentMailbox | Equipment resource |
| DiscoveryMailbox | Compliance and eDiscovery mailbox |

## Add Mailbox Size

Mailbox size is not part of `Get-EXOMailbox` — it comes from `Get-EXOMailboxStatistics`. You need to combine both calls. The example below converts the size to GB for a clean numeric output.

```powershell
$mailboxes = Get-EXOMailbox -ResultSize Unlimited

$result = foreach ($m in $mailboxes) {

    $stats = Get-EXOMailboxStatistics -Identity $m.UserPrincipalName

    $sizeBytes = $stats.TotalItemSize.Value.ToBytes()
    $sizeGB    = [math]::Round($sizeBytes / 1GB, 2)

    $aliases = $m.EmailAddresses |
        Where-Object { $_ -like "smtp:*" } |
        ForEach-Object { $_.Replace("smtp:", "") }

    [PSCustomObject]@{
        DisplayName       = $m.DisplayName
        UserPrincipalName = $m.UserPrincipalName
        PrimaryEmail      = $m.PrimarySmtpAddress
        MailboxType       = $m.RecipientTypeDetails
        MailboxSizeGB     = $sizeGB
        ItemCount         = $stats.ItemCount
        Aliases           = ($aliases -join ";")
    }
}
```

## Export to CSV

CSV is the most practical format for reviewing mailbox data. It opens directly in Excel, Google Sheets, or LibreOffice with no additional processing.

```powershell
$result | Export-Csv "mailboxes.csv" -NoTypeInformation
```

Example output:

| DisplayName | UserPrincipalName | PrimaryEmail | MailboxType | MailboxSizeGB | ItemCount | Aliases |
| --- | --- | --- | --- | --- | --- | --- |
| John Smith | `john@company.com` | `john@company.com` | UserMailbox | 2.45 | 18420 | `john.smith@company.com;j.smith@company.com` |
| Support | `support@company.com` | `support@company.com` | SharedMailbox | 12.31 | 92011 | `help@company.com` |

## Export to JSON

Use JSON if you need to feed the output into another system or script.

```powershell
$result | ConvertTo-Json -Depth 3 | Out-File "mailboxes.json"
```

## Include Licence Status (Optional)

Licence data is not available through Exchange Online — it requires Microsoft Graph. Install the module once:

```powershell
Install-Module Microsoft.Graph -Scope CurrentUser
```

Connect with the required scopes:

```powershell
Connect-MgGraph -Scopes "User.Read.All","Directory.Read.All"
```

Query assigned licences:

```powershell
Get-MgUser -All |
Select-Object DisplayName, UserPrincipalName, AssignedLicenses
```

If you need licence status combined with mailbox data in the same export, that can be scripted by joining on `UserPrincipalName`.

## Disconnect When Finished

```powershell
Disconnect-ExchangeOnline
```

## Full Script

Here is everything combined into a single script that produces a clean CSV.

```powershell
Import-Module ExchangeOnlineManagement
Connect-ExchangeOnline

$mailboxes = Get-EXOMailbox -ResultSize Unlimited

$result = foreach ($m in $mailboxes) {

    $stats = Get-EXOMailboxStatistics -Identity $m.UserPrincipalName

    $sizeBytes = $stats.TotalItemSize.Value.ToBytes()
    $sizeGB    = [math]::Round($sizeBytes / 1GB, 2)

    $aliases = $m.EmailAddresses |
        Where-Object { $_ -like "smtp:*" } |
        ForEach-Object { $_.Replace("smtp:", "") }

    [PSCustomObject]@{
        DisplayName       = $m.DisplayName
        UserPrincipalName = $m.UserPrincipalName
        PrimaryEmail      = $m.PrimarySmtpAddress
        MailboxType       = $m.RecipientTypeDetails
        MailboxSizeGB     = $sizeGB
        ItemCount         = $stats.ItemCount
        Aliases           = ($aliases -join ";")
    }
}

$result | Export-Csv "mailboxes.csv" -NoTypeInformation

Disconnect-ExchangeOnline
```

The output CSV gives you a full mailbox audit: who owns the mailbox, what type it is, its primary address, all aliases, current storage consumption, and total item count. That is a solid starting point for any identity audit, migration assessment, or licence review.