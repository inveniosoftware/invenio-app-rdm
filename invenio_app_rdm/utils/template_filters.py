# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Jinja2 template filters for Persian calendar and RTL support."""

from flask import current_app, g
from flask_babel import get_locale

from .persian_calendar import PersianCalendar, format_date_multi_calendar


def get_current_calendar():
    """Get the current calendar preference from config or user settings.

    Returns:
        str: Calendar type ('jalali', 'gregorian', 'hijri')
    """
    # Check if user has a preference (could be stored in session or user profile)
    if hasattr(g, 'calendar_preference'):
        return g.calendar_preference

    # Check locale-based default
    locale = str(get_locale())
    if locale.startswith('fa'):
        return current_app.config.get('DEFAULT_PERSIAN_CALENDAR', 'jalali')
    elif locale.startswith('ar'):
        return current_app.config.get('DEFAULT_ARABIC_CALENDAR', 'hijri')

    return 'gregorian'


def is_rtl_locale():
    """Check if current locale is RTL.

    Returns:
        bool: True if RTL, False otherwise
    """
    locale = str(get_locale())
    rtl_locales = current_app.config.get('RTL_LOCALES', ['fa', 'ar', 'he', 'ur'])
    return any(locale.startswith(rtl) for rtl in rtl_locales)


def format_date_jalali(date_obj, format_str='%Y/%m/%d'):
    """Jinja2 filter: Format date in Jalali calendar.

    Args:
        date_obj: datetime object
        format_str: Format string

    Returns:
        Formatted date string with Persian numerals
    """
    return PersianCalendar.format_jalali_date(date_obj, format_str, persian_numerals=True)


def format_datetime_jalali(date_obj, format_str='%Y/%m/%d %H:%M'):
    """Jinja2 filter: Format datetime in Jalali calendar.

    Args:
        date_obj: datetime object
        format_str: Format string

    Returns:
        Formatted datetime string with Persian numerals
    """
    return PersianCalendar.format_jalali_datetime(date_obj, format_str, persian_numerals=True)


def format_date_hijri(date_obj, format_str='%Y/%m/%d'):
    """Jinja2 filter: Format date in Hijri calendar.

    Args:
        date_obj: datetime object
        format_str: Format string

    Returns:
        Formatted date string with Persian numerals
    """
    return PersianCalendar.format_hijri_date(date_obj, format_str, persian_numerals=True)


def format_date_auto(date_obj, format_str='%Y/%m/%d'):
    """Jinja2 filter: Format date based on current locale/calendar preference.

    Args:
        date_obj: datetime object
        format_str: Format string

    Returns:
        Formatted date string
    """
    calendar = get_current_calendar()
    locale = str(get_locale())
    persian_numerals = locale.startswith('fa')

    return format_date_multi_calendar(
        date_obj, locale, calendar, format_str, persian_numerals
    )


def to_persian_numerals(value):
    """Jinja2 filter: Convert Western numerals to Persian numerals.

    Args:
        value: String or number

    Returns:
        String with Persian numerals
    """
    return PersianCalendar.to_persian_numerals(value)


def from_persian_numerals(value):
    """Jinja2 filter: Convert Persian numerals to Western numerals.

    Args:
        value: String with Persian numerals

    Returns:
        String with Western numerals
    """
    return PersianCalendar.from_persian_numerals(value)


def register_template_filters(app):
    """Register custom Jinja2 filters.

    Args:
        app: Flask application instance
    """
    app.jinja_env.filters['jalali_date'] = format_date_jalali
    app.jinja_env.filters['jalali_datetime'] = format_datetime_jalali
    app.jinja_env.filters['hijri_date'] = format_date_hijri
    app.jinja_env.filters['auto_date'] = format_date_auto
    app.jinja_env.filters['persian_numerals'] = to_persian_numerals
    app.jinja_env.filters['from_persian_numerals'] = from_persian_numerals


def inject_rtl_context():
    """Context processor to inject RTL-related variables into templates.

    Returns:
        dict: Context variables
    """
    locale = str(get_locale())
    is_rtl = is_rtl_locale()
    calendar = get_current_calendar()

    return {
        'is_rtl': is_rtl,
        'text_direction': 'rtl' if is_rtl else 'ltr',
        'current_locale': locale,
        'current_calendar': calendar,
        'use_persian_numerals': locale.startswith('fa'),
    }


def register_context_processors(app):
    """Register custom context processors.

    Args:
        app: Flask application instance
    """
    app.context_processor(inject_rtl_context)
