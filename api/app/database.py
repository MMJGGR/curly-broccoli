from __future__ import annotations
import uuid
import dataclasses
import copy

DATABASE = {
    'users': {},
    'profiles': {},
}

class _Metadata:
    def create_all(self, bind=None):
        DATABASE['users'].clear()
        DATABASE['profiles'].clear()
    def drop_all(self, bind=None):
        DATABASE['users'].clear()
        DATABASE['profiles'].clear()

class Base:
    metadata = _Metadata()

engine = object()

class Session:
    def add(self, obj):
        if isinstance(obj, User):
            DATABASE['users'][obj.id] = obj
        elif isinstance(obj, UserProfile):
            DATABASE['profiles'][obj.user_id] = obj
            user = DATABASE['users'].get(obj.user_id)
            if user:
                user.profile = obj
    def commit(self, *a, **k):
        pass
    def refresh(self, obj):
        stored = DATABASE['users'].get(obj.id) if isinstance(obj, User) else DATABASE['profiles'].get(obj.user_id)
        for field in dataclasses.fields(stored):
            setattr(obj, field.name, copy.deepcopy(getattr(stored, field.name)))
    def query(self, model):
        return Query(model)

class Query:
    def __init__(self, model):
        self.model = model
        self._results = []
    def filter_by(self, **kwargs):
        data = DATABASE['users'] if self.model is User else DATABASE['profiles']
        self._results = [
            obj for obj in data.values()
            if all(getattr(obj, k) == v for k, v in kwargs.items())
        ]
        return self
    def first(self):
        return self._results[0] if self._results else None
    def get(self, key):
        data = DATABASE['users'] if self.model is User else DATABASE['profiles']
        return data.get(key)

SessionLocal = Session

def get_db():
    return Session()

# forward declarations for type hints
from .models import User, UserProfile
