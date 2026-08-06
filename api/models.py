from django.db import models


class TimeSheetEntry(models.Model):
    user = models.CharField(max_length=150)
    project = models.CharField(max_length=255)
    date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.project} - {self.date}"
