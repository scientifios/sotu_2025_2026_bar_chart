# Q2 SOTU 2025 vs 2026 Topic Bar Chart

## What this project does
This project answers:

**Q2: What are the changes between 2025 to 2026 State of the Union addresses? How would you visualize them?**

It creates a mirrored bar chart:
- **2026** topics are shown above the x-axis.
- **2025** topics are shown below the x-axis.
- The y-axis represents topic frequency.
- The x-axis lists extracted topic keywords/subtopics.
- Topic buckets are semantically clustered into large themes.
- Categorical colors represent large buckets; subtopics use related shades.
- Hovering over a topic highlights both years' bars and shows the topic name at the top center of the visualization.

## NLP / Text Mining method
The implementation follows the text visualization ideas from class:
1. Bag-of-Words and n-gram keyword extraction.
2. TF / TF-IDF-inspired feature weighting logic for important topic terms.
3. Vector Space Model style semantic grouping.
4. Topic buckets used as clusters:
   - Economic Affordability
   - Border & Security
   - Government & Institutions
   - Health & Social Policy
   - Foreign Policy & Global Role
   - National Identity & Celebration

## How to run
Option 1: Open directly
1. Unzip the project.
2. Open `index.html` in a browser.

Option 2: Run with a local server
```bash
cd sotu_2025_2026_bar_chart
python -m http.server 8000
```

Then open:
```text
http://localhost:8000
```

## Files
```text
index.html
src/style.css
src/app.js
data/topics.json
data/State of Union 2025.txt
data/State of Union 2026.txt
```

## Notes
The topic counts are generated from the uploaded text files using phrase and keyword frequency. The clustering is semantic and course-aligned: related topic terms are grouped into buckets, similar to how a Vector Space Model and clustering can organize terms by meaning.
