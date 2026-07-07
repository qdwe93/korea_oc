# 원본(assets/images/*.jpeg) → 최적화본(site/assets/images/*.jpg) 변환
# 규격: docs/04-이미지-준비목록.md 기준. 다운스케일만 수행(업스케일 금지), JPEG 품질 80.
Add-Type -AssemblyName System.Drawing

$src = "C:\Workspaces\KOREA_OC\assets\images"
$dst = "C:\Workspaces\KOREA_OC\site\assets\images"

# 종류별 최대 가로폭
$maxWidths = @{
  'hero-main'      = 1920
  'about-visual'   = 1600
  'biz-fuel'       = 1200
  'biz-marine'     = 1200
  'biz-chem'       = 1200
  'about-greeting' = 800
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

function Save-Jpeg([System.Drawing.Bitmap]$bmp, [string]$path, [long]$quality) {
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
  $bmp.Save($path, $jpegCodec, $ep)
  $ep.Dispose()
}

Get-ChildItem $src -Filter *.jpeg | ForEach-Object {
  $name = $_.BaseName                     # 예: hero-main_1
  $kind = $name -replace '_\d+$', ''      # 예: hero-main
  if (-not $maxWidths.ContainsKey($kind)) { Write-Output "SKIP $($_.Name) (규격 미정의)"; return }

  $img = [System.Drawing.Image]::FromFile($_.FullName)
  $maxW = $maxWidths[$kind]
  $scale = [Math]::Min(1.0, $maxW / $img.Width)
  $w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)

  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'; $g.PixelOffsetMode = 'HighQuality'
  $g.DrawImage($img, 0, 0, $w, $h)
  $out = Join-Path $dst ($name + '.jpg')
  Save-Jpeg $bmp $out 80
  $g.Dispose(); $bmp.Dispose()

  $kb = [Math]::Round((Get-Item $out).Length / 1KB)
  Write-Output ("{0}  {1}x{2} -> {3}x{4}  {5} KB" -f $_.Name, $img.Width, $img.Height, $w, $h, $kb)
  $img.Dispose()
}

# OG 이미지: hero-main_1 최적화본에서 1200x630 커버 크롭
$heroPath = Join-Path $dst 'hero-main_1.jpg'
if (Test-Path $heroPath) {
  $hero = [System.Drawing.Image]::FromFile($heroPath)
  $tw = 1200; $th = 630
  $scale = [Math]::Max($tw / $hero.Width, $th / $hero.Height)
  $sw = [int]($hero.Width * $scale); $sh = [int]($hero.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap($tw, $th)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($hero, [int](($tw - $sw) / 2), [int](($th - $sh) / 2), $sw, $sh)
  $out = Join-Path $dst 'og-image.jpg'
  Save-Jpeg $bmp $out 82
  $g.Dispose(); $bmp.Dispose(); $hero.Dispose()
  Write-Output ("og-image.jpg  {0}x{1}  {2} KB" -f $tw, $th, [Math]::Round((Get-Item $out).Length / 1KB))
}
