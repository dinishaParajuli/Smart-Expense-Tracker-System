from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0004_budget"),
    ]

    operations = [
        migrations.AddField(
            model_name="goal",
            name="category",
            field=models.CharField(default="Savings", max_length=100),
        ),
        migrations.AddField(
            model_name="goal",
            name="notes",
            field=models.TextField(blank=True, default=""),
        ),
    ]
