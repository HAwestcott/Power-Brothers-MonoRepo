param(
    [string]$SiteUrl = "https://wellsfordau.sharepoint.com/sites/Design",
    [string]$ListName = "Design Hub",
    [string]$Tenant = "wellsfordau.onmicrosoft.com",
    [string]$ClientId = $env:ENTRAID_CLIENT_ID,
    [ValidateSet("DeviceLogin", "Interactive")]
    [string]$AuthMode = "DeviceLogin",
    [switch]$UseClientSecret
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ClientId)) {
    throw "ClientId is required. Pass -ClientId <app-id> or set ENTRAID_CLIENT_ID."
}

Import-Module PnP.PowerShell

if ($UseClientSecret) {
    $clientSecret = $env:ENTRAID_CLIENT_SECRET

    if ([string]::IsNullOrWhiteSpace($clientSecret)) {
        $secureSecret = Read-Host "Client secret" -AsSecureString
        $clientSecret = [System.Net.NetworkCredential]::new("", $secureSecret).Password
    }

    $connection = Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -ClientSecret $clientSecret -ReturnConnection
}
elseif ($AuthMode -eq "Interactive") {
    $connection = Connect-PnPOnline -Url $SiteUrl -Interactive -Tenant $Tenant -ClientId $ClientId -ReturnConnection
}
else {
    $connection = Connect-PnPOnline -Url $SiteUrl -DeviceLogin -Tenant $Tenant -ClientId $ClientId -ReturnConnection
}

$list = Get-PnPList -Identity $ListName -Includes Title,Id,RootFolder,Fields -Connection $connection
$fields = Get-PnPField -List $ListName -Connection $connection |
    Where-Object { -not $_.Hidden -and -not $_.ReadOnlyField } |
    Select-Object Title,InternalName,TypeAsString,Required,Group |
    Sort-Object Title
$libraries = Get-PnPList -Connection $connection |
    Where-Object { $_.BaseTemplate -eq 101 -and -not $_.Hidden } |
    Select-Object Title,Id,RootFolder

[ordered]@{
    Connection = [ordered]@{
        Url = $connection.Url
        Tenant = $Tenant
        ClientId = $ClientId
    }
    DesignRequestList = [ordered]@{
        Title = $list.Title
        Id = $list.Id
        RootFolderServerRelativeUrl = $list.RootFolder.ServerRelativeUrl
    }
    Fields = $fields
    DocumentLibraries = $libraries | ForEach-Object {
        [ordered]@{
            Title = $_.Title
            Id = $_.Id
            RootFolderServerRelativeUrl = $_.RootFolder.ServerRelativeUrl
        }
    }
} | ConvertTo-Json -Depth 6
