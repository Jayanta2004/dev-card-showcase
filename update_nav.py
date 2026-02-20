import os

files = [
    "index.html", "projects.html", "about.html", "contribute.html", 
    "statistics.html", "faq.html", "guidelines.html", "feedback.html", 
    "bug-report.html", "analytics.html"
]

target = '<li><a href="feedback.html">Feedback</a></li>'
replacement = '<li><a href="feedback.html">Feedback</a></li>\n            <li><a href="contact.html">Contact</a></li>'

for f in files:
    path = os.path.join(r"C:\Users\Gupta\Downloads\dev-card-showcase", f)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
            
            if target in content and "contact.html" not in content:
                new_content = content.replace(target, replacement)
                with open(path, "w", encoding="utf-8") as file:
                    file.write(new_content)
                print(f"Updated {f}")
            else:
                print(f"Skipped {f} (target not found or already present)")
        except Exception as e:
            print(f"Error processing {f}: {e}")
