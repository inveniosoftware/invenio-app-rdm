# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Persian (Jalali) calendar utilities for date conversion and formatting."""

from datetime import datetime

try:
    import jdatetime
    JDATETIME_AVAILABLE = True
except ImportError:
    JDATETIME_AVAILABLE = False

try:
    import hijri_converter
    HIJRI_AVAILABLE = True
except ImportError:
    HIJRI_AVAILABLE = False


class PersianCalendar:
    """Persian (Jalali) calendar utilities."""

    # Persian month names
    PERSIAN_MONTHS = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ]

    # Persian weekday names
    PERSIAN_WEEKDAYS = [
        'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه', 'یکشنبه'
    ]

    @staticmethod
    def to_persian_numerals(text):
        """Convert Western numerals to Persian numerals.

        Args:
            text: String or number to convert

        Returns:
            String with Persian numerals
        """
        if text is None:
            return ""

        text = str(text)
        persian_digits = '۰۱۲۳۴۵۶۷۸۹'
        western_digits = '0123456789'

        translation_table = str.maketrans(western_digits, persian_digits)
        return text.translate(translation_table)

    @staticmethod
    def from_persian_numerals(text):
        """Convert Persian numerals to Western numerals.

        Args:
            text: String with Persian numerals

        Returns:
            String with Western numerals
        """
        if text is None:
            return ""

        text = str(text)
        persian_digits = '۰۱۲۳۴۵۶۷۸۹'
        western_digits = '0123456789'

        translation_table = str.maketrans(persian_digits, western_digits)
        return text.translate(translation_table)

    @staticmethod
    def gregorian_to_jalali(date_obj):
        """Convert Gregorian date to Jalali date.

        Args:
            date_obj: datetime object in Gregorian calendar

        Returns:
            jdatetime object if available, None otherwise
        """
        if not JDATETIME_AVAILABLE:
            return None

        if date_obj is None:
            return None

        if isinstance(date_obj, str):
            date_obj = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))

        return jdatetime.datetime.fromgregorian(datetime=date_obj)

    @staticmethod
    def jalali_to_gregorian(jalali_date):
        """Convert Jalali date to Gregorian date.

        Args:
            jalali_date: jdatetime object

        Returns:
            datetime object
        """
        if not JDATETIME_AVAILABLE:
            return None

        if jalali_date is None:
            return None

        return jalali_date.togregorian()

    @staticmethod
    def gregorian_to_hijri(date_obj):
        """Convert Gregorian date to Hijri date.

        Args:
            date_obj: datetime object in Gregorian calendar

        Returns:
            hijri_converter.Hijri object if available, None otherwise
        """
        if not HIJRI_AVAILABLE:
            return None

        if date_obj is None:
            return None

        if isinstance(date_obj, str):
            date_obj = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))

        return hijri_converter.Gregorian(
            date_obj.year, date_obj.month, date_obj.day
        ).to_hijri()

    @staticmethod
    def format_jalali_date(date_obj, format_str='%Y/%m/%d', persian_numerals=True):
        """Format date in Jalali calendar.

        Args:
            date_obj: datetime object (Gregorian) or jdatetime object
            format_str: Format string (default: YYYY/MM/DD)
            persian_numerals: Whether to use Persian numerals

        Returns:
            Formatted date string
        """
        if not JDATETIME_AVAILABLE:
            # Fallback to Gregorian
            if isinstance(date_obj, datetime):
                formatted = date_obj.strftime(format_str)
                if persian_numerals:
                    return PersianCalendar.to_persian_numerals(formatted)
                return formatted
            return str(date_obj)

        if date_obj is None:
            return ""

        # Convert to Jalali if it's a Gregorian date
        if isinstance(date_obj, datetime):
            jalali_date = PersianCalendar.gregorian_to_jalali(date_obj)
        else:
            jalali_date = date_obj

        if jalali_date is None:
            return ""

        formatted = jalali_date.strftime(format_str)

        if persian_numerals:
            formatted = PersianCalendar.to_persian_numerals(formatted)

        return formatted

    @staticmethod
    def format_jalali_datetime(date_obj, format_str='%Y/%m/%d %H:%M:%S', persian_numerals=True):
        """Format datetime in Jalali calendar.

        Args:
            date_obj: datetime object (Gregorian)
            format_str: Format string
            persian_numerals: Whether to use Persian numerals

        Returns:
            Formatted datetime string
        """
        return PersianCalendar.format_jalali_date(date_obj, format_str, persian_numerals)

    @staticmethod
    def format_hijri_date(date_obj, format_str='%Y/%m/%d', persian_numerals=True):
        """Format date in Hijri calendar.

        Args:
            date_obj: datetime object (Gregorian)
            format_str: Format string
            persian_numerals: Whether to use Persian numerals

        Returns:
            Formatted date string in Hijri
        """
        if not HIJRI_AVAILABLE:
            return ""

        hijri_date = PersianCalendar.gregorian_to_hijri(date_obj)
        if hijri_date is None:
            return ""

        # Format manually since hijri_converter doesn't have strftime
        formatted = f"{hijri_date.year}/{hijri_date.month:02d}/{hijri_date.day:02d}"

        if persian_numerals:
            formatted = PersianCalendar.to_persian_numerals(formatted)

        return formatted

    @staticmethod
    def get_month_name_persian(month_num):
        """Get Persian month name.

        Args:
            month_num: Month number (1-12)

        Returns:
            Persian month name
        """
        if 1 <= month_num <= 12:
            return PersianCalendar.PERSIAN_MONTHS[month_num - 1]
        return ""

    @staticmethod
    def get_weekday_name_persian(weekday_num):
        """Get Persian weekday name.

        Args:
            weekday_num: Weekday number (0=Monday, 6=Sunday)

        Returns:
            Persian weekday name
        """
        if 0 <= weekday_num <= 6:
            return PersianCalendar.PERSIAN_WEEKDAYS[weekday_num]
        return ""


def format_date_multi_calendar(date_obj, locale='fa', calendar='jalali',
                                 format_str='%Y/%m/%d', persian_numerals=True):
    """Format date with support for multiple calendars.

    Args:
        date_obj: datetime object
        locale: Locale code (default: 'fa')
        calendar: Calendar type ('jalali', 'gregorian', 'hijri')
        format_str: Format string
        persian_numerals: Whether to use Persian numerals

    Returns:
        Formatted date string
    """
    if date_obj is None:
        return ""

    if isinstance(date_obj, str):
        try:
            date_obj = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
        except ValueError:
            return date_obj

    if calendar == 'jalali':
        return PersianCalendar.format_jalali_date(date_obj, format_str, persian_numerals)
    elif calendar == 'hijri':
        return PersianCalendar.format_hijri_date(date_obj, format_str, persian_numerals)
    else:  # gregorian
        formatted = date_obj.strftime(format_str)
        if persian_numerals and locale == 'fa':
            return PersianCalendar.to_persian_numerals(formatted)
        return formatted
