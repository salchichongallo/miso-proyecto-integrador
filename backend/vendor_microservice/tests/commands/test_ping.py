from src.commands.ping import Ping


class TestPing:
    def test_ping(self):
        result = Ping().execute()
        assert result == 'pong'
