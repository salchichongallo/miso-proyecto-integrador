from src.commands.ping import PingCommand

class TestPingCommand:
    def test_ping(self):
        result = PingCommand().execute()
        assert result == 'pong'
