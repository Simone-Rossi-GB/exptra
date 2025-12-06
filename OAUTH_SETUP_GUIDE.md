# OAuth2 Deep Linking Setup Guide for ExpTra

## ✅ Completed Steps

The following has been implemented:

1. **Deep Link Handler** (`src/lib/deeplink.js`)
   - Universal handler for Capacitor (iOS/Android), Tauri (Desktop), and Web
   - Listens for `exptra://auth/callback` deep links
   - Emits events for OAuth callbacks

2. **Updated OAuth Methods** (`src/lib/pocketBase.js`)
   - Platform detection (mobile/desktop/web)
   - Deep link OAuth flow for native apps
   - Standard popup flow for web browsers
   - Automatic browser closure after authentication

3. **Deep Link Initialization** (`src/pages/main.jsx`)
   - Handler is initialized on app startup

4. **Capacitor Configuration** (`capacitor.config.json`)
   - Custom scheme `exptra://` configured

5. **OAuth Proxy Page** (`public/oauth/callback.html`)
   - Bridges HTTPS redirect to custom scheme
   - Hosted at: `https://exptra.ddns.net/oauth/callback.html`

6. **Dependencies Installed**
   - `@capacitor/app` - For deep link listening
   - `@capacitor/browser` - For OAuth in system browser

---

## 🔧 Required Configuration Steps

### 1. Android Configuration

Edit `android/app/src/main/AndroidManifest.xml` and add this inside the `<activity>` tag:

```xml
<!-- OAuth Deep Link Intent Filter -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <!-- Custom scheme for OAuth callback -->
    <data android:scheme="exptra" />
    <data android:host="auth" />
    <data android:pathPrefix="/callback" />
</intent-filter>
```

### 2. iOS Configuration

Edit `ios/App/App/Info.plist` and add this:

```xml
<!-- OAuth Deep Link URL Scheme -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>exptra</string>
    </array>
    <key>CFBundleURLName</key>
    <string>com.exptra.app</string>
  </dict>
</array>
```

### 3. Tauri Configuration (Desktop)

Edit `src-tauri/tauri.conf.json` and add deep link protocol:

```json
{
  "tauri": {
    "bundle": {
      "identifier": "com.exptra.app",
      "deeplink": {
        "schemes": ["exptra"]
      }
    }
  }
}
```

Also create a Rust handler in `src-tauri/src/main.rs`:

```rust
use tauri::Manager;

#[tauri::command]
fn handle_deep_link(url: String) {
    println!("Deep link received: {}", url);
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Register deep link handler
            let window = app.get_window("main").unwrap();

            #[cfg(target_os = "macos")]
            {
                use tauri::Manager;
                app.listen_global("deep-link", move |event| {
                    if let Some(payload) = event.payload() {
                        window.emit("deep-link", payload).unwrap();
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![handle_deep_link])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 4. Sync Capacitor Native Projects

After modifying Android/iOS configurations, run:

```bash
npx cap sync
```

This copies web assets and updates native projects.

### 5. Configure OAuth Providers

#### Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services > Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add these **Authorized redirect URIs**:
   - `https://exptra.ddns.net/oauth/callback.html` (for deep linking)
   - `https://exptra.ddns.net/api/oauth2-redirect` (PocketBase default)

#### GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Update **Authorization callback URL** to:
   - `https://exptra.ddns.net/oauth/callback.html` (for deep linking)
   - Or add both URLs if provider allows multiple

### 6. Deploy OAuth Proxy Page

Ensure `public/oauth/callback.html` is accessible at:
```
https://exptra.ddns.net/oauth/callback.html
```

The page should:
- Receive OAuth callback from Google/GitHub
- Extract `code` and `state` parameters
- Redirect to `exptra://auth/callback?code=xxx&state=yyy`

---

## 🧪 Testing

### Test on Web Browser

1. Run development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:5173`
3. Click "Continua con Google" or "Continua con GitHub"
4. Should use standard popup OAuth flow (no deep linking needed)

### Test on iOS Simulator

1. Build and run:
   ```bash
   npx cap sync ios
   npx cap open ios
   ```

2. Run from Xcode
3. Click OAuth button
4. Should open Safari with Google/GitHub login
5. After authentication, should redirect back to app via `exptra://auth/callback`

### Test on Android Emulator

1. Build and run:
   ```bash
   npx cap sync android
   npx cap open android
   ```

2. Run from Android Studio
3. Click OAuth button
4. Should open Chrome with Google/GitHub login
5. After authentication, should redirect back to app via `exptra://auth/callback`

### Test on Tauri Desktop

1. Build and run:
   ```bash
   cd src-tauri
   cargo tauri dev
   ```

2. Click OAuth button
3. Should open system browser with Google/GitHub login
4. After authentication, should redirect back to app via `exptra://auth/callback`

---

## 🔍 Troubleshooting

### OAuth Buttons Stay on "Accesso in corso..."

**Cause**: Deep link not being received by app.

**Solutions**:
1. Check if deep link is configured in Android/iOS manifest
2. Verify `setupDeepLinkHandler()` is called in `main.jsx`
3. Check browser console for errors
4. Ensure OAuth provider has correct redirect URI

### "OAuth timeout - il login è scaduto"

**Cause**: User took longer than 5 minutes to complete OAuth.

**Solution**: Increase timeout in `src/lib/deeplink.js`:

```javascript
export function waitForOAuthCallback(timeoutMs = 600000) { // 10 minutes
  // ...
}
```

### Deep Link Not Opening App

**Android**:
- Check `android:autoVerify="true"` is set
- Verify app is installed and not force-stopped
- Clear app data and try again

**iOS**:
- Check `CFBundleURLSchemes` is correct
- Rebuild app after changing Info.plist
- Check Xcode logs for deep link errors

**Desktop (Tauri)**:
- Verify deep link handler is registered in Rust
- Check Tauri logs for errors
- Test deep link manually: `open exptra://auth/callback?code=test`

### "Google OAuth non configurato su PocketBase"

**Cause**: PocketBase OAuth providers not configured.

**Solution**:
1. Open PocketBase admin panel: `https://exptra.ddns.net/_/`
2. Go to **Settings > Auth Providers**
3. Enable and configure Google OAuth
4. Add Client ID and Client Secret from Google Cloud Console

---

## 📱 Platform-Specific Notes

### iOS
- Deep links work immediately after app installation
- No special setup needed beyond Info.plist
- Universal Links (HTTPS-based) can be added later for better UX

### Android
- Deep links require app to be installed
- `android:autoVerify` enables automatic verification
- App Links (HTTPS-based) require hosting `assetlinks.json`

### Desktop (Tauri)
- Deep links require OS registration (handled by Tauri)
- First launch may require user permission
- Works on Windows, macOS, and Linux

---

## 🎯 Next Steps

1. **Configure Android & iOS manifests** (see sections 1-2 above)
2. **Update OAuth provider redirect URIs** (section 5)
3. **Sync Capacitor projects**: `npx cap sync`
4. **Test on each platform** (section 🧪 Testing)
5. **Deploy proxy page** to `https://exptra.ddns.net/oauth/callback.html`

---

## 📚 Resources

- [Capacitor Deep Links](https://capacitorjs.com/docs/guides/deep-links)
- [Capacitor App Plugin](https://capacitorjs.com/docs/apis/app)
- [Capacitor Browser Plugin](https://capacitorjs.com/docs/apis/browser)
- [PocketBase OAuth2](https://pocketbase.io/docs/authentication/#oauth2-integration)
- [Tauri Deep Linking](https://tauri.app/v1/guides/features/deep-linking)
