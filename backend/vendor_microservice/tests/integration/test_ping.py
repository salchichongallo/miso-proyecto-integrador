import pytest

class TestPing:
    @pytest.mark.usefixtures('client')
    def test_ping(self, client):
        response = client.get('/ping')
        assert response.status_code == 200
        assert 'pong' in response.json
