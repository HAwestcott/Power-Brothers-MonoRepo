param(
    [string]$Tenant = "wellsfordau.onmicrosoft.com",
    [string]$ClientId = $env:ENTRAID_CLIENT_ID,
    [string]$SiteHostname = "wellsfordau.sharepoint.com",
    [string]$SitePath = "/sites/Design",
    [string]$ListName = "Design Hub",
    [string]$ProjectsFolderSharingUrl = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ClientId)) {
    throw "ClientId is required. Pass -ClientId <app-id> or set ENTRAID_CLIENT_ID."
}

$clientSecret = $env:ENTRAID_CLIENT_SECRET

if ([string]::IsNullOrWhiteSpace($clientSecret)) {
    $secureSecret = Read-Host "Client secret" -AsSecureString
    $clientSecret = [System.Net.NetworkCredential]::new("", $secureSecret).Password
}

$tokenResponse = Invoke-RestMethod `
    -Method Post `
    -Uri "https://login.microsoftonline.com/$Tenant/oauth2/v2.0/token" `
    -ContentType "application/x-www-form-urlencoded" `
    -Body @{
        client_id     = $ClientId
        client_secret = $clientSecret
        scope         = "https://graph.microsoft.com/.default"
        grant_type    = "client_credentials"
    }

$headers = @{ Authorization = "Bearer $($tokenResponse.access_token)" }

function Invoke-GraphGet {
    param([string]$Uri)

    Invoke-RestMethod -Method Get -Uri $Uri -Headers $headers
}

function ConvertTo-GraphShareId {
    param([string]$Url)

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Url)
    $base64 = [Convert]::ToBase64String($bytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")

    "u!$base64"
}

$site = Invoke-GraphGet "https://graph.microsoft.com/v1.0/sites/${SiteHostname}:$SitePath"
$lists = Invoke-GraphGet "https://graph.microsoft.com/v1.0/sites/$($site.id)/lists?`$select=id,displayName,name,webUrl,list,sharepointIds"
$designRequestList = $lists.value | Where-Object { $_.displayName -eq $ListName -or $_.name -eq $ListName } | Select-Object -First 1

if ($null -eq $designRequestList) {
    throw "Could not find list '$ListName' on $SiteHostname$SitePath."
}

$columns = Invoke-GraphGet "https://graph.microsoft.com/v1.0/sites/$($site.id)/lists/$($designRequestList.id)/columns?`$select=id,name,displayName,columnGroup,description,hidden,readOnly,required"

$projectsFolder = $null

if (-not [string]::IsNullOrWhiteSpace($ProjectsFolderSharingUrl)) {
    $shareId = ConvertTo-GraphShareId $ProjectsFolderSharingUrl
    $projectsFolder = Invoke-GraphGet "https://graph.microsoft.com/v1.0/shares/$shareId/driveItem?`$select=id,name,webUrl,parentReference"
}

[ordered]@{
    Site = [ordered]@{
        Id = $site.id
        DisplayName = $site.displayName
        WebUrl = $site.webUrl
    }
    DesignRequestList = [ordered]@{
        Id = $designRequestList.id
        Name = $designRequestList.name
        DisplayName = $designRequestList.displayName
        WebUrl = $designRequestList.webUrl
        SharePointListId = $designRequestList.sharepointIds.listId
    }
    Fields = $columns.value |
        Where-Object { -not $_.hidden -and -not $_.readOnly } |
        Sort-Object displayName |
        ForEach-Object {
            [ordered]@{
                DisplayName = $_.displayName
                InternalName = $_.name
                Required = $_.required
                Group = $_.columnGroup
            }
        }
    DocumentLibraries = $lists.value |
        Where-Object { $_.list.template -eq "documentLibrary" } |
        Sort-Object displayName |
        ForEach-Object {
            [ordered]@{
                Id = $_.id
                Name = $_.name
                DisplayName = $_.displayName
                WebUrl = $_.webUrl
                SharePointListId = $_.sharepointIds.listId
            }
        }
    ProjectsFolder = if ($null -ne $projectsFolder) {
        [ordered]@{
            Id = $projectsFolder.id
            Name = $projectsFolder.name
            WebUrl = $projectsFolder.webUrl
            DriveId = $projectsFolder.parentReference.driveId
            ParentPath = $projectsFolder.parentReference.path
        }
    }
} | ConvertTo-Json -Depth 8
