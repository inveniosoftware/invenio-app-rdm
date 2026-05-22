# SPDX-FileCopyrightText: 2023 Graz University of Technology.
# SPDX-License-Identifier: MIT

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
