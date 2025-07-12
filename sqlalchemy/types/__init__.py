class TypeDecorator:
    impl = None
    def process_bind_param(self, value, dialect):
        return value
    def process_result_value(self, value, dialect):
        return value

class String:
    pass
