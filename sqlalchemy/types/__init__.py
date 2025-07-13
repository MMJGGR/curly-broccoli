class TypeDecorator:
    impl = None
    def process_bind_param(self, value, dialect):
        raise NotImplementedError
    def process_result_value(self, value, dialect):
        raise NotImplementedError

class String:
    pass
