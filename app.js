(function () {
  "use strict";

  const TIPS = [
    {
      id: "transit",
      title: "Use public transportation",
      desc: "If everyone uses public transportation then less carbon is produced beucase less people are using indidual vehicles. The carbon created per person in transport decreases and is shared.",
    },
    {
      id: "meat",
      title: "Reduce meat consumption",
      desc: "The production of meat in the agricultural industry creates a lot of carbon emissions. By switching to a vegitarian or vegan diet you will decrease the demand for meat which will decrease the amount of resources allocated to prodcucing meat. This will result in fewer emissions.",
    },
    {
      id: "renew",
      title: "Switch to renewable energy",
      desc: "Renewable energies prevent the burning of coal and other fossil fuels which releases carbon emissions. Instead by using technologies like solar pannels for your home you can decrease the amount of energy you use from combustion which will decrease the carbon emissions you are responsible for.",
    },
    {
      id: "elec",
      title: "Reduce electricity usage",
      desc: "You can try using less of your devices or appliances which will decrease your net electricity consumption. Another thing you can do is unplug your devices when they are not being using to avoid phantom load.",
    },
    {
      id: "appliances",
      title: "Buy energy-efficient appliances",
      desc: "Stores spesifically sell appliences that are more energy efficent.",
    },
    {
      id: "water",
      title: "Reduce water waste",
      desc: "It takes power to pump, heat, and treat water which can result in a larger footprint for you. So instead try using less water and reduce the amount that you waste. For example while brushing or washing the dishes turn the sink off when you are not using it.",
    },
    {
      id: "compost",
      title: "Compost food waste",
      desc: "Scraps can rot in landfills and burp out methane and other emissions that will impact the information. Instead if you compost stuff like your food waste it can be used in agriculture or other stuff.",
    },
    {
      id: "recycle",
      title: "Recycle properly",
      desc: "Recycle your stuff properly. For instance pizza boxes shouldn't have oil in them. If you don't ahere to the recycling rules or don't know about them then you might do it wrong and your stuff will end up in a land fill.",
    },
    {
      id: "fashion",
      title: "Reduce fast fashion purchases",
      desc: "Fast fashion uses materials like polyester and have processes that impact the enviornment poorly. Instead use clothes and cloths that last longer and are more sustainable like cotton.",
    },
    {
      id: "reuse",
      title: "Use reusable products",
      desc: "Don't use single use items like plastic bags. Instead use or purchase items that you dont have to throw away and can reuse. For example you can buy metal water bottles or toat bags.",
    },
    {
      id: "carpool",
      title: "Carpool",
      desc: "Much like public transportation you can try carpooling with friends or other people to split up the emissions you created or are responsible for.",
    },
  ];

  const STORAGE_TIPS = "apes_carbon_tips_v1";

  function loadTipState() {
    try {
      const raw = localStorage.getItem(STORAGE_TIPS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveTipState(state) {
    try {
      localStorage.setItem(STORAGE_TIPS, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initTips() {
    const grid = document.getElementById("tips-grid");
    if (!grid) return;

    const state = loadTipState();

    TIPS.forEach((tip) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tip-card";
      btn.dataset.id = tip.id;
      if (state[tip.id]) btn.classList.add("is-done");

      const title = document.createElement("strong");
      title.textContent = tip.title;
      const desc = document.createElement("span");
      desc.className = "desc";
      desc.textContent = tip.desc;
      btn.appendChild(title);
      btn.appendChild(desc);

      btn.addEventListener("click", () => {
        btn.classList.toggle("is-done");
        state[tip.id] = btn.classList.contains("is-done");
        saveTipState(state);
      });

      grid.appendChild(btn);
    });
  }

  function syncKwhInputs() {
    const num = document.getElementById("kwh");
    const slider = document.getElementById("kwh-slider");
    const label = document.getElementById("kwh-slider-label");
    if (!num || !slider || !label) return;

    const setLabel = () => {
      label.textContent = String(num.value || "0");
    };

    num.addEventListener("input", () => {
      slider.value = num.value || "0";
      setLabel();
    });

    slider.addEventListener("input", () => {
      num.value = slider.value;
      setLabel();
    });

    setLabel();
  }

  /**
   * Simplified educational model (metric tons CO2e / year).
   * Not for regulatory or offset accounting.
   */
  function estimateFootprint(values) {
    const milesWeek = Math.max(0, Number(values.miles) || 0);
    const kwhMonth = Math.max(0, Number(values.kwh) || 0);
    const diet = values.diet;
    const flights = Math.max(0, Number(values.flights) || 0);

    const annualMiles = milesWeek * 52;
    const carTons = (annualMiles * 0.4) / 1000;
    const elecTons = (kwhMonth * 12 * 0.42) / 1000;

    const dietAdd = { meat: 2.2, balanced: 1.4, veg: 0.7 }[diet] ?? 1.4;
    const flightTons = flights * 0.55;
    const baselineOther = 2.5;

    const total = baselineOther + carTons + elecTons + dietAdd + flightTons;
    return { total, carTons, elecTons, dietAdd, flightTons, baselineOther };
  }

  function tierForTotal(tons) {
    if (tons < 10) {
      return {
        label: "Below average for this simple model",
        hint: "Nice work in the toy calculator world. Keep the same curiosity when you look at real inventories, because flight class, car type, and local grid mix all move the needle.",
        tone: "good",
      };
    }
    if (tons <= 16) {
      return {
        label: "About average for this simple model",
        hint: "You landed where a lot of back of the envelope U.S. style totals land. If you want the biggest cuts on paper, flights and car miles are usually the loud knobs, then home electricity.",
        tone: "mid",
      };
    }
    return {
      label: "Above average for this simple model",
      hint: "High numbers here usually mean lots of driving, lots of flying, or a fossil heavy grid feeding a big house. Pick one area to study for a week and track what is actually fixable in your life, not what the internet yells about.",
      tone: "high",
    };
  }

  function initCalculator() {
    const form = document.getElementById("footprint-form");
    const resultBox = document.getElementById("calc-result");
    const tonsEl = document.getElementById("result-tons");
    const tierEl = document.getElementById("result-tier");
    const hintEl = document.getElementById("result-hint");
    if (!form || !resultBox || !tonsEl || !tierEl || !hintEl) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const values = {
        miles: fd.get("miles"),
        kwh: fd.get("kwh"),
        diet: fd.get("diet"),
        flights: fd.get("flights"),
      };

      const { total } = estimateFootprint(values);
      const rounded = Math.round(total * 10) / 10;
      tonsEl.textContent = String(rounded);

      const tier = tierForTotal(total);
      tierEl.textContent = tier.label;
      hintEl.textContent = tier.hint;
      tierEl.style.color =
        tier.tone === "good" ? "var(--accent)" : tier.tone === "mid" ? "var(--warning)" : "var(--danger)";

      resultBox.hidden = false;
      resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    form.addEventListener("reset", () => {
      resultBox.hidden = true;
      const slider = document.getElementById("kwh-slider");
      const label = document.getElementById("kwh-slider-label");
      const kwh = document.getElementById("kwh");
      requestAnimationFrame(() => {
        if (slider && kwh) {
          slider.value = kwh.value;
          if (label) label.textContent = kwh.value;
        }
      });
    });
  }

  function initAccordion() {
    const root = document.getElementById("system-accordion");
    if (!root) return;

    const items = Array.from(root.querySelectorAll(".accordion-item"));

    root.querySelectorAll(".accordion-trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".accordion-item");
        const panel = item?.querySelector(".accordion-panel");
        if (!item || !panel) return;

        const willOpen = !item.classList.contains("is-open");

        items.forEach((it) => {
          const p = it.querySelector(".accordion-panel");
          const t = it.querySelector(".accordion-trigger");
          it.classList.remove("is-open");
          if (p) p.hidden = true;
          if (t) t.setAttribute("aria-expanded", "false");
        });

        if (willOpen) {
          item.classList.add("is-open");
          panel.hidden = false;
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  const QUIZ = [
    {
      id: "q1",
      text: "Which choice typically adds the most CO₂e per passenger-mile for long distances?",
      options: ["Intercity rail", "Commercial aviation", "Carpool in a hybrid", "City bus"],
      correct: 1,
    },
    {
      id: "q2",
      text: "What household change often reduces carbon footprint the most in fossil-heavy grids?",
      options: ["Switching to LEDs only", "Lowering thermostat 1°F once", "Using clean electricity + major efficiency", "Recycling aluminum occasionally"],
      correct: 2,
    },
    {
      id: "q3",
      text: "Globally, which sector is commonly the largest share of anthropogenic CO₂ emissions?",
      options: ["Residential lighting", "Energy and heat (electricity, fuels, heavy industry)", "Music streaming", "Office paper"],
      correct: 1,
    },
    {
      id: "q4",
      text: "When oceans absorb excess atmospheric CO₂, a major consequence is:",
      options: ["Ocean acidification", "Ozone hole expansion over cities", "SO₂ smog in deserts", "Indoor radon spikes"],
      correct: 0,
    },
    {
      id: "q5",
      text: "The ice albedo feedback loop is best described as:",
      options: ["Negative feedback that stabilizes climate", "Positive feedback that amplifies warming", "A nutrient cycle in soil", "A predator prey oscillation"],
      correct: 1,
    },
    {
      id: "q6",
      text: "Which gas is a long-lived greenhouse gas driving most warming since preindustrial times?",
      options: ["Radon", "Argon", "Carbon dioxide (CO₂)", "Neon"],
      correct: 2,
    },
    {
      id: "q7",
      text: "Deforestation changes the fast carbon cycle mainly by:",
      options: ["Increasing stratospheric ozone", "Releasing stored carbon and reducing uptake", "Eliminating soil nitrogen entirely", "Stopping ocean currents"],
      correct: 1,
    },
  ];

  function buildQuiz() {
    const form = document.getElementById("quiz-form");
    if (!form) return;

    QUIZ.forEach((q, qi) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "quiz-q";
      const legend = document.createElement("legend");
      legend.textContent = `${qi + 1}. ${q.text}`;
      fieldset.appendChild(legend);

      const opts = document.createElement("div");
      opts.className = "quiz-options";

      q.options.forEach((labelText, oi) => {
        const id = `${q.id}_o${oi}`;
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = q.id;
        input.value = String(oi);
        input.id = id;
        const span = document.createElement("span");
        span.textContent = labelText;
        label.appendChild(input);
        label.appendChild(span);
        opts.appendChild(label);
      });

      fieldset.appendChild(opts);
      form.appendChild(fieldset);
    });

    const actions = document.createElement("div");
    actions.className = "quiz-actions";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn btn-primary";
    submit.textContent = "Score my quiz";
    actions.appendChild(submit);
    form.appendChild(actions);
  }

  function scoreQuiz() {
    let score = 0;
    QUIZ.forEach((q) => {
      const sel = document.querySelector(`input[name="${q.id}"]:checked`);
      if (sel && Number(sel.value) === q.correct) score += 1;
    });
    return score;
  }

  function initQuiz() {
    buildQuiz();
    const form = document.getElementById("quiz-form");
    const result = document.getElementById("quiz-result");
    const scoreEl = document.getElementById("quiz-score");
    const totalEl = document.getElementById("quiz-total");
    const msgEl = document.getElementById("quiz-message");
    const retry = document.getElementById("quiz-retry");

    if (!form || !result || !scoreEl || !totalEl || !msgEl) return;

    totalEl.textContent = String(QUIZ.length);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const score = scoreQuiz();
      scoreEl.textContent = String(score);

      const ratio = score / QUIZ.length;
      if (ratio >= 0.71) {
        msgEl.textContent = "You are in solid shape. Keep connecting vocabulary to mechanisms, not just buzzwords.";
        msgEl.style.color = "var(--accent)";
      } else {
        msgEl.textContent = "Totally normal on a first pass. Reread the atmosphere ocean panel and the graph blurbs, then try again without rushing.";
        msgEl.style.color = "var(--warning)";
      }

      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    if (retry) {
      retry.addEventListener("click", () => {
        form.reset();
        result.hidden = true;
        window.scrollTo({ top: form.offsetTop - 80, behavior: "smooth" });
      });
    }
  }

  function initCharts() {
    if (typeof Chart === "undefined") return;

    const co2Years = [];
    const co2ppm = [];
    for (let y = 1960; y <= 2024; y += 1) {
      co2Years.push(y);
      const t = (y - 1960) / (2024 - 1960);
      co2ppm.push(317 + t * (424 - 317) + Math.sin(y / 3) * 0.6);
    }

    const tempYears = [];
    const tempAnom = [];
    for (let y = 1960; y <= 2024; y += 1) {
      tempYears.push(y);
      const t = (y - 1960) / (2024 - 1960);
      tempAnom.push(-0.03 + t * 1.15 + Math.sin(y / 5) * 0.04);
    }

    const commonOpts = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          borderColor: "rgba(148, 163, 184, 0.35)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", maxTicksLimit: 8 },
          grid: { color: "rgba(148, 163, 184, 0.12)" },
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(148, 163, 184, 0.12)" },
        },
      },
    };

    const co2Ctx = document.getElementById("chart-co2");
    if (co2Ctx) {
      new Chart(co2Ctx, {
        type: "line",
        data: {
          labels: co2Years,
          datasets: [
            {
              label: "CO₂ (ppm)",
              data: co2ppm,
              borderColor: "#5eead4",
              backgroundColor: "rgba(94, 234, 212, 0.15)",
              fill: true,
              tension: 0.25,
              pointRadius: 0,
            },
          ],
        },
        options: {
          ...commonOpts,
          scales: {
            ...commonOpts.scales,
            y: {
              ...commonOpts.scales.y,
              title: { display: true, text: "ppm", color: "#cbd5e1" },
            },
            x: {
              ...commonOpts.scales.x,
              title: { display: true, text: "Year", color: "#cbd5e1" },
            },
          },
        },
      });
    }

    const tempCtx = document.getElementById("chart-temp");
    if (tempCtx) {
      new Chart(tempCtx, {
        type: "line",
        data: {
          labels: tempYears,
          datasets: [
            {
              label: "°C anomaly",
              data: tempAnom,
              borderColor: "#a78bfa",
              backgroundColor: "rgba(167, 139, 250, 0.12)",
              fill: true,
              tension: 0.25,
              pointRadius: 0,
            },
          ],
        },
        options: {
          ...commonOpts,
          scales: {
            ...commonOpts.scales,
            y: {
              ...commonOpts.scales.y,
              title: { display: true, text: "°C vs baseline", color: "#cbd5e1" },
            },
            x: {
              ...commonOpts.scales.x,
              title: { display: true, text: "Year", color: "#cbd5e1" },
            },
          },
        },
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initTips();
    syncKwhInputs();
    initCalculator();
    initAccordion();
    initQuiz();
    initCharts();
  });
})();
