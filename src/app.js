
const chartEl = document.getElementById("chart");
const legendEl = document.getElementById("legend");
const detailsEl = document.getElementById("details");

const shade = (hex, amt) => {
  let c = hex.replace("#", "");
  let num = parseInt(c, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;
  return "#" + (0x1000000 + (Math.max(0,Math.min(255,r))<<16) + (Math.max(0,Math.min(255,g))<<8) + Math.max(0,Math.min(255,b))).toString(16).slice(1);
};

fetch("data/topics.json").then(r => r.json()).then(raw => {
  let allTopics = raw.topics;
  const buckets = raw.buckets;
  const bucketNames = Object.keys(buckets);

  bucketNames.forEach(name => {
    const item = document.createElement("span");
    item.className = "legend-item";
    item.innerHTML = `<span class="swatch" style="background:${buckets[name].base}"></span>${name}`;
    legendEl.appendChild(item);
  });

  function render(filter="all") {
    let topics = allTopics.filter(d => {
      if (filter === "increased") return d.year2026 > d.year2025;
      if (filter === "decreased") return d.year2026 < d.year2025;
      if (filter === "shared") return d.year2026 >= 10 && d.year2025 >= 10;
      return true;
    });

    const W = Math.max(1180, topics.length * 58 + 160), H = 690;
    const margin = {top: 64, right: 40, bottom: 160, left: 80};
    const midY = 310;
    const chartW = W - margin.left - margin.right;
    const maxVal = Math.max(...topics.flatMap(d => [d.year2025, d.year2026]), 1);
    const topScale = v => midY - (v / maxVal) * 220;
    const botScale = v => midY + (v / maxVal) * 220;
    const step = chartW / topics.length;
    const barW = Math.min(34, step * .58);

    chartEl.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mirrored bar chart comparing 2025 and 2026 State of the Union topic frequency">
      <text id="hover-title" x="${W / 2}" y="20" text-anchor="middle" class="hover-title"></text>
      <text x="${margin.left}" y="32" class="year-label">2026 State of the Union — upper bars</text>
      <text x="${margin.left}" y="${H-16}" class="year-label">2025 State of the Union — lower bars</text>
      <line x1="${margin.left}" x2="${W-margin.right}" y1="${midY}" y2="${midY}" class="midline"></line>
      <text x="${W-255}" y="${midY-12}" class="small">same topic axis</text>
      <g id="plot"></g>
    </svg>`;
    const svg = chartEl.querySelector("svg");
    const plot = chartEl.querySelector("#plot");
    const hoverTitle = chartEl.querySelector("#hover-title");

    for (let i=0;i<=5;i++){
      const v = Math.round(maxVal*i/5);
      const yTop = topScale(v), yBot = botScale(v);
      plot.insertAdjacentHTML("beforeend", `<line x1="${margin.left}" x2="${W-margin.right}" y1="${yTop}" y2="${yTop}" stroke="#eaecf0"/><text x="42" y="${yTop+4}" class="axis">${v}</text>`);
      if(i>0) plot.insertAdjacentHTML("beforeend", `<line x1="${margin.left}" x2="${W-margin.right}" y1="${yBot}" y2="${yBot}" stroke="#eaecf0"/><text x="42" y="${yBot+4}" class="axis">${v}</text>`);
    }

    const bucketCounters = {};
    topics.forEach((d, idx) => {
      bucketCounters[d.bucket] = bucketCounters[d.bucket] || 0;
      const base = buckets[d.bucket].base;
      const color = shade(base, bucketCounters[d.bucket] * 14 - 8);
      bucketCounters[d.bucket] += 1;
      const x = margin.left + idx * step + step/2;
      const h26 = midY - topScale(d.year2026);
      const h25 = botScale(d.year2025) - midY;
      const safeTopic = d.topic.replace(/"/g, "&quot;");
      plot.insertAdjacentHTML("beforeend", `
        <rect class="topic-bg topic-${idx}" x="${x-step/2+2}" y="42" width="${step-4}" height="${H-205}"></rect>
        <rect class="bar bar-${idx}" data-idx="${idx}" x="${x-barW/2}" y="${midY-h26}" width="${barW}" height="${h26}" fill="${color}"></rect>
        <rect class="bar bar-${idx}" data-idx="${idx}" x="${x-barW/2}" y="${midY}" width="${barW}" height="${h25}" fill="${color}"></rect>
        <text x="${x}" y="${midY-h26-7}" text-anchor="middle" class="axis">${d.year2026}</text>
        <text x="${x}" y="${midY+h25+16}" text-anchor="middle" class="axis">${d.year2025}</text>
        <text class="topic-label label-${idx}" data-idx="${idx}" x="${x}" y="${midY+250}" text-anchor="end" transform="rotate(-50 ${x} ${midY+250})">${safeTopic}</text>
      `);
    });

    function showDetails(d) {
      const delta = d.year2026 - d.year2025;
      const trend = delta > 0 ? `increased by ${delta}` : delta < 0 ? `decreased by ${Math.abs(delta)}` : "stayed equal";
      const terms26 = d.details2026.map(x => `${x[0]} (${x[1]})`).join(", ") || "No strong match";
      const terms25 = d.details2025.map(x => `${x[0]} (${x[1]})`).join(", ") || "No strong match";
      const snip26 = d.snippets2026[0] || "No short quote found.";
      const snip25 = d.snippets2025[0] || "No short quote found.";
      detailsEl.innerHTML = `
        <h3>${d.topic}</h3>
        <p><b>Bucket:</b> ${d.bucket}. Topic frequency ${trend}: 2026 = <b>${d.year2026}</b>, 2025 = <b>${d.year2025}</b>.</p>
        <div class="detail-grid">
          <div class="detail-box"><b>2026 keywords</b><p class="small">${terms26}</p><p>${snip26}</p></div>
          <div class="detail-box"><b>2025 keywords</b><p class="small">${terms25}</p><p>${snip25}</p></div>
        </div>`;
    }

    function highlight(idx) {
      svg.querySelectorAll(".bar").forEach(b => b.classList.add("dim"));
      svg.querySelectorAll(`.bar-${idx}`).forEach(b => { b.classList.remove("dim"); b.classList.add("highlight"); });
      svg.querySelector(`.topic-${idx}`).classList.add("show");
      hoverTitle.textContent = topics[idx].topic;
      hoverTitle.classList.add("show");
      showDetails(topics[idx]);
    }
    function clear() {
      svg.querySelectorAll(".bar").forEach(b => b.classList.remove("dim","highlight"));
      svg.querySelectorAll(".topic-bg").forEach(b => b.classList.remove("show"));
      hoverTitle.textContent = "";
      hoverTitle.classList.remove("show");
    }

    svg.querySelectorAll("[data-idx]").forEach(el => {
      el.addEventListener("mouseenter", e => highlight(+e.target.dataset.idx));
      el.addEventListener("mouseleave", clear);
      el.addEventListener("click", e => highlight(+e.target.dataset.idx));
    });
  }

  render();
  document.querySelectorAll(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render(btn.dataset.filter);
    });
  });
});
