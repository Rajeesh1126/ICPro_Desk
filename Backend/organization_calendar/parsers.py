import json

from rest_framework.exceptions import ParseError
from rest_framework.parsers import DataAndFiles, MultiPartParser


class CalendarMultipartParser(MultiPartParser):
    def parse(self, stream, media_type=None, parser_context=None):
        parsed = super().parse(stream, media_type, parser_context)
        # JSON metadata preserves empty arrays and booleans in multipart requests.
        if 'payload' not in parsed.data:
            return parsed
        try:
            payload = json.loads(parsed.data['payload'])
        except (ValueError, TypeError):
            raise ParseError('payload must contain valid JSON.')
        if not isinstance(payload, dict):
            raise ParseError('payload must be a JSON object.')
        payload['attachments'] = parsed.files.getlist('attachments')
        return DataAndFiles(payload, {})
