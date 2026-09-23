"""Соединение с Turso по HTTP с совместимыми ошибками и закрытием ресурсов."""

import sqlite3

import turso_serverless


class CloudConnection:
    def __init__(self, url: str, token: str):
        self.connection = turso_serverless.connect(url, auth_token=token)
        self.connection.row_factory = turso_serverless.Row

    def __enter__(self):
        return self

    def __exit__(self, error_type, error, traceback):
        try:
            if error_type is None:
                self._call('commit')
            else:
                self._call('rollback')
        finally:
            self.close()

    def _call(self, method, *args):
        try:
            return getattr(self.connection, method)(*args)
        except turso_serverless.Error as exc:
            raise sqlite3.OperationalError('Ошибка запроса к облачной базе.') from exc

    def execute(self, sql, parameters=()):
        return self._call('execute', sql, parameters)

    def executemany(self, sql, rows):
        return self._call('executemany', sql, rows)

    def executescript(self, script):
        return self._call('executescript', script)

    def close(self):
        self._call('close')
