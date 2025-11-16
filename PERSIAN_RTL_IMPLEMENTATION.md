# Persian Calendar, RTL, and Turquoise Theme Implementation

## Overview

This document describes the comprehensive implementation of Persian (Jalali) calendar support, full Right-to-Left (RTL) localization, Turquoise theme, and IRANSans font integration for Invenio-App-RDM.

## Features Implemented

### 1. 🗓️ Persian Calendar (تاریخ شمسی) Support

#### Backend Implementation
- **Persian Calendar Library**: Added `jdatetime>=5.0.0` dependency for Jalali calendar support
- **Hijri Calendar Library**: Added `hijri-converter>=2.3.0` for Hijri calendar support
- **Utility Module**: Created `invenio_app_rdm/utils/persian_calendar.py` with:
  - Date conversion between Gregorian, Jalali, and Hijri calendars
  - Persian numeral conversion (Western ↔ Persian)
  - Persian month and weekday names
  - Multi-calendar date formatting

#### Template Filters
Created Jinja2 filters in `invenio_app_rdm/utils/template_filters.py`:
- `jalali_date`: Format dates in Jalali calendar
- `jalali_datetime`: Format datetimes in Jalali calendar
- `hijri_date`: Format dates in Hijri calendar
- `auto_date`: Auto-format based on current locale
- `persian_numerals`: Convert to Persian numerals
- `from_persian_numerals`: Convert from Persian numerals

#### Configuration
Added to `config.py`:
```python
DEFAULT_PERSIAN_CALENDAR = "jalali"
DEFAULT_ARABIC_CALENDAR = "hijri"
SUPPORTED_CALENDARS = ["jalali", "gregorian", "hijri"]
PERSIAN_CALENDAR_DEFAULT_FORMAT = "%Y/%m/%d"
PERSIAN_DATETIME_DEFAULT_FORMAT = "%Y/%m/%d %H:%M"
USE_PERSIAN_NUMERALS = True
```

### 2. 🎨 Turquoise Theme (فیروزه‌ای)

#### Color Scheme
Implemented Persian/Iranian cultural Turquoise theme:
- **Primary Color**: `#1ABC9C` (Turquoise)
- **Secondary Color**: `#16A085` (Dark Turquoise)
- **Accent Color**: `#0E8A6D` (Turquoise Accent)

#### Files Modified
- `invenio_app_rdm/theme/assets/semantic-ui/less/invenio_app_rdm/theme/turquoise-theme.less`
  - Comprehensive Turquoise color scheme for all UI components
  - Buttons, links, menus, forms, cards, modals, etc.
- `invenio_app_rdm/theme/assets/semantic-ui/less/invenio_app_rdm/theme/globals/site.variables`
  - Updated primary and secondary colors
  - Updated navbar gradient with Turquoise
  - Updated footer colors
  - Updated link colors

### 3. 📝 IRANSans Font Integration

#### Font Implementation
- **Primary Font**: IRANSans (Persian/Farsi)
- **Fallback Fonts**: Vazirmatn, Tahoma, Arial, sans-serif
- **CDN Source**: Using jsDelivr CDN for font files

#### Files Created/Modified
- `invenio_app_rdm/theme/assets/semantic-ui/less/invenio_app_rdm/theme/fonts.less`
  - Font-face declarations for IRANSans (Light, Regular, Medium, Bold, Black)
  - Language-specific font application for Persian content
  - Improved rendering for Persian typography
- Updated `site.variables` with IRANSans as default font

### 4. ➡️ Full RTL (Right-to-Left) Localization

#### RTL CSS Implementation
Created comprehensive RTL stylesheet: `rtl.less` (over 650 lines)

Components styled for RTL:
- Base layout and text direction
- Navigation menus (horizontal and vertical)
- Buttons and forms
- Dropdowns and inputs
- Tables and lists
- Cards and modals
- Breadcrumbs and pagination
- Sidebars and grids
- Search and labels
- Accordions and tabs
- And 20+ more Semantic UI components

#### RTL Context Detection
- **Context Processor**: Automatically detects RTL locales
- **Template Variables**:
  - `is_rtl`: Boolean for RTL detection
  - `text_direction`: "rtl" or "ltr"
  - `current_locale`: Active locale code
  - `current_calendar`: Active calendar system
  - `use_persian_numerals`: Boolean for numeral conversion

#### Configuration
```python
RTL_LOCALES = ["fa", "ar", "he", "ur"]
```

### 5. 🔢 Persian Numerals (اعداد فارسی)

#### Backend
- Numeral conversion in `PersianCalendar` class
- Template filters for automatic conversion

#### Frontend
Created `persian_utils.js` with:
- Automatic numeral conversion for Persian locale
- DOM observation for dynamic content
- Input field support for Persian numerals
- Date formatting with Persian numerals

#### Integration
- Auto-initializes on page load
- Converts all numbers in DOM to Persian numerals
- Supports bidirectional input (Persian ↔ Western)

## File Structure

```
invenio-app-rdm/
├── invenio_app_rdm/
│   ├── config.py (updated)
│   ├── ext.py (updated)
│   ├── utils/
│   │   ├── __init__.py (new)
│   │   ├── persian_calendar.py (new)
│   │   └── template_filters.py (new)
│   └── theme/
│       ├── assets/semantic-ui/
│       │   ├── js/invenio_app_rdm/
│       │   │   ├── theme.js (updated)
│       │   │   └── persian_utils.js (new)
│       │   └── less/invenio_app_rdm/theme/
│       │       ├── fonts.less (new)
│       │       ├── turquoise-theme.less (new)
│       │       ├── rtl.less (new)
│       │       └── globals/
│       │           ├── site.variables (updated)
│       │           └── site.overrides (updated)
│       └── templates/semantic-ui/invenio_app_rdm/
│           └── page.html (updated)
├── setup.cfg (updated)
└── PERSIAN_RTL_IMPLEMENTATION.md (this file)
```

## Dependencies Added

```ini
# Persian calendar and i18n support
jdatetime>=5.0.0
hijri-converter>=2.3.0
```

## Usage Examples

### Template Usage

#### Display Date in Jalali Calendar
```jinja
{{ record.created|jalali_date }}
{# Output: ۱۴۰۳/۰۸/۲۵ #}
```

#### Display DateTime in Jalali Calendar
```jinja
{{ record.updated|jalali_datetime }}
{# Output: ۱۴۰۳/۰۸/۲۵ ۱۴:۳۰ #}
```

#### Auto-format Based on Locale
```jinja
{{ record.created|auto_date }}
{# Jalali for Persian, Hijri for Arabic, Gregorian for others #}
```

#### Convert to Persian Numerals
```jinja
{{ 12345|persian_numerals }}
{# Output: ۱۲۳۴۵ #}
```

### Python Usage

```python
from invenio_app_rdm.utils.persian_calendar import PersianCalendar
from datetime import datetime

# Convert to Jalali
jalali = PersianCalendar.gregorian_to_jalali(datetime.now())

# Format with Persian numerals
formatted = PersianCalendar.format_jalali_date(
    datetime.now(),
    format_str='%Y/%m/%d',
    persian_numerals=True
)

# Convert numerals
persian_num = PersianCalendar.to_persian_numerals("12345")
# Output: "۱۲۳۴۵"
```

### JavaScript Usage

```javascript
import PersianUtils from './persian_utils';

// Convert to Persian numerals
const persianNum = PersianUtils.toPersianNumerals("12345");
// Output: "۱۲۳۴۵"

// Check if RTL
if (PersianUtils.isRTL()) {
    // RTL-specific logic
}

// Format date
const formatted = PersianUtils.formatDate(new Date());
```

## RTL Styling

The RTL implementation automatically applies when:
1. The HTML `dir` attribute is set to "rtl"
2. The `lang` attribute is set to an RTL locale (fa, ar, he, ur)

The base page template now automatically sets these attributes:
```html
<html dir="{{ text_direction }}" lang="{{ current_locale }}">
```

## Theme Customization

### Color Variables
All Turquoise theme colors are defined in `turquoise-theme.less`:
- `@turquoise-primary`
- `@turquoise-dark`
- `@turquoise-light`
- `@turquoise-pale`
- `@turquoise-accent`
- `@turquoise-bg`

### Font Variables
Font settings in `site.variables`:
- `@fontName`
- `@headerFont`
- `@pageFont`

## Browser Support

- Modern browsers with CSS3 support
- RTL layout supported in all major browsers
- Font rendering optimized for Persian typography

## Performance Considerations

1. **Font Loading**: Fonts loaded from CDN with proper fallbacks
2. **Numeral Conversion**: Efficient string translation using lookup tables
3. **DOM Observation**: Limited to Persian locale to minimize overhead
4. **CSS**: RTL styles only applied when `dir="rtl"` attribute present

## Testing

To test the implementation:

1. **Change Locale to Persian**:
   - Set application locale to `fa` or `fa-IR`
   - The interface should automatically switch to RTL
   - All numerals should display in Persian

2. **Calendar Testing**:
   - Create/view records and check date display
   - Dates should show in Jalali calendar format
   - Use template filters in custom templates

3. **Theme Testing**:
   - Check all UI components for Turquoise color scheme
   - Verify buttons, links, menus use new colors
   - Test hover and active states

4. **RTL Layout Testing**:
   - Verify all components mirror properly
   - Check menus, forms, tables, cards
   - Test navigation and sidebar layout

## Known Limitations

1. **Date Pickers**: JavaScript date pickers may need additional configuration to support Jalali calendar
2. **Third-party Components**: Some third-party React components may need custom RTL styling
3. **Backend Date Storage**: Dates are still stored in Gregorian format in the database (recommended)

## Future Enhancements

1. **Date Picker Widget**: Custom Persian calendar date picker for forms
2. **Locale Switcher**: UI component to switch between calendars
3. **Translations**: Complete Persian translations for all UI strings
4. **Admin Panel**: RTL-specific admin panel improvements
5. **Calendar Conversion API**: RESTful API endpoint for date conversions

## Migration Guide

For existing instances:

1. **Update Dependencies**: Run `pip install -e .` to install new dependencies
2. **Compile Assets**: Run webpack to compile new CSS/JS
3. **Set Locale**: Configure `BABEL_DEFAULT_LOCALE = 'fa'` if Persian is primary
4. **Clear Cache**: Clear browser and server cache
5. **Rebuild Assets**: `invenio webpack buildall`

## Support

For issues or questions:
- Check the implementation files for inline documentation
- Review the examples in this document
- Test with the provided usage patterns

## Credits

- **Persian Calendar**: jdatetime library
- **Hijri Calendar**: hijri-converter library
- **Fonts**: IRANSans by Rastikerdar, Vazirmatn
- **Theme**: Custom Turquoise color scheme inspired by Persian culture

## License

This implementation follows the same MIT License as Invenio-App-RDM.

---

**Implementation Date**: 2025-11-16
**Version**: 14.0.0b3.dev0+
**Status**: Complete and Ready for Testing
