# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""RDM User Schemas."""

from invenio_users_resources.services.schemas import (
    NotificationPreferences,
    UserPreferencesSchema,
    UserSchema,
)
from marshmallow import fields


class UserPreferencesNotificationsSchema(UserPreferencesSchema):
    """Schema extending preferences with notification preferences for model validation."""

    notifications = fields.Nested(NotificationPreferences)


class NotificationsUserSchema(UserSchema):
    """Schema extending preferences with notification preferences for user service."""

    preferences = fields.Nested(UserPreferencesNotificationsSchema)
