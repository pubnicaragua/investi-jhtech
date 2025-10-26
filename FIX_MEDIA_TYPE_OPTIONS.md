# Script para Actualizar MediaTypeOptions

Ejecutar estos comandos en PowerShell desde la raíz del proyecto:

```powershell
# Reemplazar MediaTypeOptions.Images por ['images']
(Get-Content "src\screens\CommunitySettingsScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Images", "['images']" | Set-Content "src\screens\CommunitySettingsScreen.tsx"

(Get-Content "src\screens\CreateCommunityScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Images", "['images']" | Set-Content "src\screens\CreateCommunityScreen.tsx"

(Get-Content "src\screens\CreatePostScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Images", "['images']" | Set-Content "src\screens\CreatePostScreen.tsx"

(Get-Content "src\screens\GroupChatScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Images", "['images']" | Set-Content "src\screens\GroupChatScreen.tsx"

(Get-Content "src\screens\UploadAvatarScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Images", "['images']" | Set-Content "src\screens\UploadAvatarScreen.tsx"

(Get-Content "src\screens\EditCommunityScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Images", "['images']" | Set-Content "src\screens\EditCommunityScreen.tsx"

(Get-Content "src\screens\CreateCommunityPostScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Images", "['images']" | Set-Content "src\screens\CreateCommunityPostScreen.tsx"

(Get-Content "src\screens\ChatScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Images", "['images']" | Set-Content "src\screens\ChatScreen.tsx"

# Reemplazar MediaTypeOptions.Videos por ['videos']
(Get-Content "src\screens\CreatePostScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Videos", "['videos']" | Set-Content "src\screens\CreatePostScreen.tsx"

(Get-Content "src\screens\GroupChatScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Videos", "['videos']" | Set-Content "src\screens\GroupChatScreen.tsx"

(Get-Content "src\screens\CreateCommunityPostScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Videos", "['videos']" | Set-Content "src\screens\CreateCommunityPostScreen.tsx"

(Get-Content "src\screens\ChatScreen.tsx") -replace "ImagePicker\.MediaTypeOptions\.Videos", "['videos']" | Set-Content "src\screens\ChatScreen.tsx"
```

O ejecutar todo de una vez:

```powershell
$files = @(
  "src\screens\CommunitySettingsScreen.tsx",
  "src\screens\CreateCommunityScreen.tsx",
  "src\screens\CreatePostScreen.tsx",
  "src\screens\GroupChatScreen.tsx",
  "src\screens\UploadAvatarScreen.tsx",
  "src\screens\EditCommunityScreen.tsx",
  "src\screens\CreateCommunityPostScreen.tsx",
  "src\screens\ChatScreen.tsx"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    (Get-Content $file) -replace "ImagePicker\.MediaTypeOptions\.Images", "['images']" -replace "ImagePicker\.MediaTypeOptions\.Videos", "['videos']" | Set-Content $file
    Write-Host "✅ Actualizado: $file"
  }
}
```
