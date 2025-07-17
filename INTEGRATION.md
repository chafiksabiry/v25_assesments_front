# Assessment Micro-Frontend Integration Guide

This document explains how to integrate the Assessment Micro-Frontend into your main application.

## Overview

The Assessment Micro-Frontend provides standalone assessment experiences for:

1. **Language Proficiency** - Tests user's ability in different languages
2. **Contact Center Skills** - Evaluates skills relevant to contact center operations

## Integration Methods

### 1. Direct URL Navigation

The simplest integration method is to redirect users to a specific assessment URL.

#### Language Assessment URL Format:
```
https://your-assessment-domain.com/assessment/language/{LANGUAGE_NAME}?userId={USER_ID}&token={AUTH_TOKEN}&returnUrl={RETURN_URL}
```

#### Contact Center Assessment URL Format:
```
https://your-assessment-domain.com/assessment/contact-center/{SKILL_ID}?userId={USER_ID}&token={AUTH_TOKEN}&returnUrl={RETURN_URL}
```

#### URL Parameters:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `userId`    | Yes | The unique identifier for the user taking the assessment |
| `token`     | Yes | Authentication token for API access |
| `returnUrl` | Yes | URL to return to after assessment completion or exit |

#### Example:
```
https://assessments.example.com/assessment/language/Arabic?userId=12345&token=jwt.token.here&returnUrl=https://main-app.example.com/dashboard
```

### 2. ✨ RECOMMENDED: Clean URL with Direct Parameters (No Redundancy)

**NEW and improved approach** - Pass language name and ISO code directly without redundancy:

#### Clean Language Assessment URL Format:
```
https://your-assessment-domain.com/assessment/language?lang={LANGUAGE_NAME}&code={ALPHA2_CODE}&userId={USER_ID}&token={AUTH_TOKEN}&returnUrl={RETURN_URL}
```

#### Direct Parameters:

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `lang` | Yes* | Language name in English | `English`, `French`, `Spanish` |
| `code` | Yes* | ISO 639-1 alpha-2 language code | `en`, `fr`, `es` |

*Required when using the clean route

#### Examples:

**✅ RECOMMENDED - Clean URLs without redundancy:**
```
# English
https://assessments.example.com/assessment/language?lang=English&code=en&userId=12345&token=jwt.token.here&returnUrl=https://main-app.example.com/dashboard

# French
https://assessments.example.com/assessment/language?lang=French&code=fr&userId=12345&token=jwt.token.here&returnUrl=https://main-app.example.com/dashboard

# Arabic
https://assessments.example.com/assessment/language?lang=Arabic&code=ar&userId=12345&token=jwt.token.here&returnUrl=https://main-app.example.com/dashboard
```

**Multiple language examples:**
```
# German  
/assessment/language?lang=German&code=de

# Japanese
/assessment/language?lang=Japanese&code=ja

# Portuguese
/assessment/language?lang=Portuguese&code=pt

# Dutch
/assessment/language?lang=Dutch&code=nl

# Italian
/assessment/language?lang=Italian&code=it

# Spanish
/assessment/language?lang=Spanish&code=es

# Chinese
/assessment/language?lang=Chinese&code=zh

# Russian  
/assessment/language?lang=Russian&code=ru
```

#### Benefits of Clean URLs:

1. **🚫 No redundancy** - Language name appears only once (no more `/language?language=`)
2. **🚫 No AI calls needed** - Bypasses OpenAI for language name normalization
3. **🎯 Exact control** - You specify exactly what language name and code to use
4. **⚡ Faster loading** - No waiting for language detection/mapping
5. **📏 Cleaner URLs** - More professional and easier to understand
6. **🔧 Better reliability** - No dependency on external AI services for basic navigation

### 3. Legacy URLs (Still Supported)

For backward compatibility, these legacy formats are still supported:

#### Legacy with redundant 'language' parameter:
```
/assessment/language?language=English&code=en   # redundant: "language" appears twice
```

#### Legacy with path + query parameters (has redundancy):
```
/assessment/language/English?language=English&code=en   # redundant: "English" appears twice
```

#### Legacy without query parameters (uses AI/mapping):
```
/assessment/language/English
```

#### Fallback Behavior:

The system automatically handles different URL formats with priority:

1. **Clean route** (recommended): `/assessment/language?lang=English&code=en`
   - Uses `lang` parameter (preferred)
   - Fastest and most reliable

2. **Clean route with legacy parameter**: `/assessment/language?language=English&code=en`
   - Uses `language` parameter (backward compatibility)
   - Still clean but has redundancy with URL path

3. **Legacy with query params**: `/assessment/language/English?lang=English&code=en`  
   - Uses query parameters, ignores path parameter
   - Has redundancy but works

4. **Legacy without query params**: `/assessment/language/English`
   - Uses existing AI/mapping logic to determine language code
   - Slower, requires AI processing

This ensures backward compatibility with existing integrations while encouraging adoption of the cleaner approach.

### 4. IFrame Integration

You can embed the assessment as an iframe within your application:

```html
<!-- ✅ RECOMMENDED: Clean URL with 'lang' parameter -->
<iframe
  src="https://your-assessment-domain.com/assessment/language?lang=Spanish&code=es&userId=12345&token=jwt.token.here"
  width="100%"
  height="700px"
  frameborder="0"
></iframe>

<!-- ⚠️ Legacy URL with 'language' parameter (still works) -->
<iframe
  src="https://your-assessment-domain.com/assessment/language?language=Spanish&code=es&userId=12345&token=jwt.token.here"
  width="100%"
  height="700px"
  frameborder="0"
></iframe>

<!-- ❌ Legacy URL with redundancy (not recommended) -->
<iframe
  src="https://your-assessment-domain.com/assessment/language/Spanish?language=Spanish&code=es&userId=12345&token=jwt.token.here"
  width="100%"
  height="700px"
  frameborder="0"
></iframe>
```

### 5. Standalone Deployment Mode

For development or internal use, you can run the micro-frontend in standalone mode by setting environment variables:

```
VITE_RUN_MODE=standalone
VITE_STANDALONE_USER_ID=your-test-user-id
VITE_STANDALONE_TOKEN=your-test-token
```

## Language Support

The language assessment supports any language name as input. The system will:

1. Take the language name from query parameters (recommended) or URL path (legacy)
2. Use the provided ISO code or determine it using lookup table/AI
3. Generate appropriate assessment content in that language

### Handling Non-Latin Language Names

For languages with non-Latin scripts in legacy URLs, URL encode the language name:

```
# Legacy format (not recommended)
/assessment/language/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9  (for "Русский")

# Clean format (recommended)
/assessment/language?lang=Русский&code=ru
```

## Authentication Flow

1. When a user is directed to the assessment, the micro-frontend checks for auth parameters in the URL
2. These parameters are stored in localStorage for persistence during the assessment
3. The token is used for all API calls to the backend
4. When the user completes or exits, they are directed back to the `returnUrl`

## API Communication

The micro-frontend communicates with your backend using these endpoints:

- `POST /api/assessments/language` - Saves language assessment results
- `POST /api/assessments/contact-center` - Saves contact center skill assessment results

Ensure your backend implements these endpoints to receive the assessment data.

## JavaScript Integration Example

```javascript
// ✅ RECOMMENDED: Function to navigate using clean URLs with 'lang' parameter
function navigateToLanguageAssessment(languageName, languageCode, userId, token, returnUrl) {
  const params = new URLSearchParams({
    lang: languageName,  // 'lang' instead of 'language' - no redundancy!
    code: languageCode,
    userId: userId,
    token: token,
    returnUrl: returnUrl
  });
  
  const url = `https://your-domain.com/assessment/language?${params.toString()}`;
  
  // Open in current window
  window.location.href = url;
  
  // Or open in new window/tab
  // window.open(url, '_blank');
}

// Example usage:
navigateToLanguageAssessment('English', 'en', '12345', 'your-token', 'https://your-app.com/dashboard');
navigateToLanguageAssessment('French', 'fr', '12345', 'your-token', 'https://your-app.com/dashboard');

// ⚠️ Legacy function with 'language' parameter (still works but has redundancy)
function navigateToLanguageAssessmentLegacy(languageName, languageCode, userId, token, returnUrl) {
  const params = new URLSearchParams({
    language: languageName,  // redundant with URL path "/assessment/language"
    code: languageCode,
    userId: userId,
    token: token,
    returnUrl: returnUrl
  });
  
  const url = `https://your-domain.com/assessment/language?${params.toString()}`;
  window.location.href = url;
}

// 📋 Quick reference for different approaches:
// ✅ Best:     /assessment/language?lang=English&code=en
// ⚠️ OK:       /assessment/language?language=English&code=en  (redundant)
// ❌ Avoid:    /assessment/language/English?language=English&code=en  (double redundancy)
```

## Styling Customization

The micro-frontend uses Tailwind CSS. To customize the appearance:

1. Fork the repository
2. Modify the `tailwind.config.js` file to match your brand colors
3. Deploy your customized version

## Troubleshooting

- **Missing Parameters Error**: When using clean URLs, ensure both `lang` (or `language`) and `code` parameters are provided
- **Authentication Errors**: Ensure the token is valid and has necessary permissions
- **Language Detection Issues**: For uncommon languages, the clean URL approach eliminates detection issues
- **Return URL Not Working**: Ensure the returnUrl is properly URL encoded 