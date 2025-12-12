"""
Detection modules for video event detection system.
Each detector implements a standardized interface for detecting specific events.
"""

from .fire import FireDetector
from .phone import PhoneDetector
from .hands_pockets import HandsInPocketsDetector
from .people_counter import PeopleCounter

__all__ = [
    "FireDetector",
    "PhoneDetector",
    "HandsInPocketsDetector",
    "PeopleCounter",
]
