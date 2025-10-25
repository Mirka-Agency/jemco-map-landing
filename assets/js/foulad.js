document.addEventListener("DOMContentLoaded", function () {
  // --- 1. Intersection Observer for Scroll Animations ---
  const observerOptions = {
    root: null, // viewport
    rootMargin: "0px",
    threshold: 0.1, // 10% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, observerOptions);

  // Observe all elements with the .animate-on-scroll class
  const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
  elementsToAnimate.forEach((el) => {
    observer.observe(el);
  });

  // --- 2. Interactive Savings Chart ---

  // Check if Chart.js and the canvas element exist
  if (
    typeof Chart === "undefined" ||
    !document.getElementById("savingsChart")
  ) {
    console.error("Chart.js or canvas element not found.");
    return;
  }

  const ctx = document.getElementById("savingsChart").getContext("2d");
  const slider = document.getElementById("years-slider");
  const yearsDisplay = document.getElementById("years-display");

  // --- Constants for Calculation (user-provided) ---
  // Annual cost savings for 8 produced units (in میلیارد تومان)
  const COST_SAVED_VS_SIEMENS_PER_YEAR_BILLION = 6.5; // میلیارد تومان در سال
  const COST_SAVED_VS_ABB_PER_YEAR_BILLION = 9.5; // میلیارد تومان در سال

  // --- Global Chart Configuration ---
  Chart.defaults.color = "#a0a0c0"; // Legend/Axis color
  Chart.defaults.font.family = "Vazirmatn";
  Chart.defaults.plugins.tooltip.backgroundColor = "#0a0c1f";
  Chart.defaults.plugins.tooltip.titleFont = {
    family: "Vazirmatn",
    weight: "bold",
  };
  Chart.defaults.plugins.tooltip.bodyFont = { family: "Vazirmatn" };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 5;

  // --- Create the Chart Instance ---
  const savingsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [], // To be populated by updateChart
      datasets: [
        {
          label: "صرفه‌جویی در برابر ای‌بی‌بی",
          data: [], // To be populated
          borderColor: "#f94144", // Red
          backgroundColor: "rgba(249, 65, 68, 0.1)",
          borderWidth: 3,
          fill: "start",
          tension: 0.3,
        },
        {
          label: "صرفه‌جویی در برابر زیمنس",
          data: [], // To be populated
          borderColor: "#5341f3ff", // Orange
          backgroundColor: "rgba(243, 114, 44, 0.1)",
          borderWidth: 3,
          fill: "start",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "مبلغ صرفه‌جویی (میلیارد تومان)",
            font: {
              family: "Vazirmatn",
              size: 14,
              weight: "600",
            },
            color: "#e0e0e0",
          },
          ticks: {
            // Format numbers to be more readable (e.g., 100k, 1M)
            callback: function (value, index, values) {
              if (value >= 1000000) {
                return value / 1000000 + "M";
              }
              if (value >= 1000) {
                return value / 1000 + "k";
              }
              return value;
            },
          },
        },
        x: {
          title: {
            display: true,
            text: "سال‌های بهره‌برداری",
            font: {
              family: "Vazirmatn",
              size: 14,
              weight: "600",
            },
            color: "#e0e0e0",
          },
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "rectRounded",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            // Tooltip formatting will be handled dynamically and localized
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) label += " — ";
              if (context.parsed.y !== null) {
                label +=
                  context.parsed.y.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  }) + " میلیارد تومان";
              }
              return label;
            },
          },
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
    },
  });

  // --- Function to Update Chart Data ---
  function updateChart(years) {
    let labels = [];
    let siemensData = [];
    let abbData = [];
    for (let i = 1; i <= years; i++) {
      labels.push(`سال ${i}`);
      // Use provided annual cost savings (in میلیارد تومان) and accumulate
      const siemensCumulative = COST_SAVED_VS_SIEMENS_PER_YEAR_BILLION * i;
      const abbCumulative = COST_SAVED_VS_ABB_PER_YEAR_BILLION * i;
      siemensData.push(siemensCumulative);
      abbData.push(abbCumulative);
    }

    // Update the chart's data, set axis label to cost and rerender
    savingsChart.data.labels = labels;
    savingsChart.data.datasets[0].data = abbData;
    savingsChart.data.datasets[1].data = siemensData;
    savingsChart.options.scales.y.title.text = "مبلغ صرفه‌جویی (میلیارد تومان)";
    savingsChart.update();
  }

  // --- Event Listener for the Slider ---
  slider.addEventListener("input", (event) => {
    const years = event.target.value;
    yearsDisplay.textContent = `${years} سال`;
    updateChart(years);
  });

  // --- Chart mode toggles ---
  // chart is now cost-only (میلیارد تومان)

  // --- Initial Chart Render ---
  // Initialize the chart with the slider's default value
  updateChart(slider.value);

  // --- Request Form Popup (contact) ---
  const openRequestBtn = document.getElementById("openRequestForm");

  function buildRequestFormHtml() {
    return `
		<div class="form-popup-backdrop" id="requestFormBackdrop">
		  <div class="form-popup" role="dialog" aria-modal="true">
		    <div class="form-close" id="requestFormClose">✕</div>
		    <h3>فرم درخواست همکاری</h3>
		    <form id="requestForm" novalidate>
		      <div class="row">
		        <div class="field">
		          <label for="name">نام و نام خانوادگی <span style="color:#ff8080">*</span></label>
		          <input id="name" name="name" required />
		          <div class="error" data-for="name"></div>
		        </div>
		        <div class="field">
		          <label for="phone">شماره تماس <span style="color:#ff8080">*</span></label>
		          <input id="phone" name="phone" required placeholder="مثال: 0912xxxxxxx" />
		          <div class="error" data-for="phone"></div>
		        </div>
		      </div>
		      <div class="row">
		        <div class="field">
		          <label for="company">نام مجموعه </label>
		          <input id="company" name="company" />
		          <div class="error" data-for="company"></div>
		        </div>
		        <div class="field">
		          <label for="email">ایمیل </label>
		          <input id="email" name="email" type="email" placeholder="user@example.com" />
		          <div class="error" data-for="email"></div>
		        </div>
		      </div>
		      <div class="field">
		        <label for="message">متن پیام <span style="color:#ff8080">*</span></label>
		        <textarea id="message" name="message" required></textarea>
		        <div class="error" data-for="message"></div>
		      </div>
		      <div class="actions">
		        <button type="button" class="btn btn-cancel" id="requestFormCancel">انصراف</button>
		        <button type="submit" class="btn btn-send">ارسال</button>
		      </div>
		    </form>
		  </div>
		</div>
		`;
  }

  function showToast(text) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => (t.style.opacity = "1"), 20);
    setTimeout(() => {
      t.style.opacity = "0";
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }

  function openRequestForm() {
    // don't open multiple
    if (document.getElementById("requestFormBackdrop")) return;
    const html = buildRequestFormHtml();
    document.body.insertAdjacentHTML("beforeend", html);
    const backdrop = document.getElementById("requestFormBackdrop");
    const close = document.getElementById("requestFormClose");
    const cancel = document.getElementById("requestFormCancel");
    const form = document.getElementById("requestForm");

    // focus first field
    document.getElementById("name").focus();

    function clean() {
      backdrop.remove();
    }

    backdrop.addEventListener("click", (ev) => {
      if (ev.target === backdrop) clean();
    });
    close.addEventListener("click", clean);
    cancel.addEventListener("click", clean);

    // stop propagation so underlying elements don't react
    backdrop.addEventListener("wheel", (e) => e.stopPropagation(), {
      passive: false,
    });
    backdrop.addEventListener("touchmove", (e) => e.stopPropagation(), {
      passive: false,
    });

    // validation helpers
    function setError(name, msg) {
      const el = form.querySelector(`[data-for="${name}"]`);
      const input = form.querySelector(`[name="${name}"]`);
      if (el) el.textContent = msg || "";
      if (input) {
        if (msg) input.classList.add("invalid");
        else input.classList.remove("invalid");
      }
    }

    function validate() {
      let ok = true;
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name) {
        setError("name", "نام و نام خانوادگی الزامی است");
        ok = false;
      } else setError("name", "");
      if (!phone) {
        setError("phone", "شماره تماس الزامی است");
        ok = false;
      } else {
        const p = phone.replace(/\s|-/g, "");
        if (!/^\+?\d{7,15}$/.test(p)) {
          setError("phone", "شماره تماس معتبر نیست");
          ok = false;
        } else setError("phone", "");
      }
      if (email) {
        // simple email check
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          setError("email", "ایمیل معتبر نیست");
          ok = false;
        } else setError("email", "");
      } else setError("email", "");
      if (!message) {
        setError("message", "متن پیام الزامی است");
        ok = false;
      } else setError("message", "");
      return ok;
    }

    // live clear errors
    form.addEventListener("input", (ev) => {
      const name = ev.target.name;
      if (!name) return;
      setError(name, "");
    });

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (!validate()) return;

      const WEBHOOK_URL =
        "https://n8n.mirka.agency/webhook-test/landing-form-data";
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value.trim(); // حذف فاصله های اضافی از ابتدا و انتهای ورودی
      });
      clean();
      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // اعلام می کنیم که داده ارسالی JSON است
        },
        body: JSON.stringify(data), // تبدیل آبجکت داده به رشته JSON
      })
        .then((response) => {
          // n8n معمولاً پاسخ موفقیت آمیز 200 یا 202 می دهد
          if (response.ok) {
            showToast("پیام شما ارسال شد. متشکریم!");
            setTimeout(() => {
              clean();
              form.reset();
            }, 600);
          } else {
            setError(
              "message",
              "❌ خطایی در سرور n8n رخ داد. لطفا تنظیمات را بررسی کنید."
            );
          }
        })
        .catch((error) => {
          setError(
            "message",
            "❌ خطای اتصال به سرور. مطمئن شوید آدرس Webhook درست است."
          );
        });
    });
  }

  if (openRequestBtn)
    openRequestBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openRequestForm();
    });
});
