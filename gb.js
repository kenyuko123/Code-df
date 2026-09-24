(async () => {
  "use strict";

  // =========================================================
  // THÔNG TIN
  // =========================================================

  console.log(
    "%cNgười tạo tool : @tao.la.bao0907 (kenyuko)",
    "font-weight:bold;color:#00ff88;font-size:14px"
  );

  console.log(
    "%c💚 Nhớ FL kênh của tôi nhé!",
    "font-weight:bold;color:#ffd700;font-size:15px"
  );

  console.log(
    "%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "color:#888"
  );

  // =========================================================
  // SOURCE & CONFIG
  // =========================================================

  const SOURCE_URL =
    "https://raw.githubusercontent.com/kenyuko123/Code-df/refs/heads/main/code.txt";

  const RESULT_TIMEOUT = 10000;       
  const FIND_BUTTON_TIMEOUT = 3000;
  const DELAY_BETWEEN_CODES = 1200;   

  const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

  // =========================================================
  // COOKIE
  // =========================================================

  async function acceptCookie() {
    const all = [...document.querySelectorAll("button,[role='button'],a")];
    const btn = all.find(el => {
      if (el.offsetParent === null) return false;
      const text = (el.innerText || "").replace(/\s+/g, " ").trim();
      return text === "Chấp nhận tất cả cookie tùy chọn";
    });
    if (btn) {
      console.log("🍪 Chấp nhận cookie...");
      btn.click();
      await sleep(100);
    }
  }

  // =========================================================
  // TÌM INPUT
  // =========================================================

  function getInput() {
    const inputs = [...document.querySelectorAll("input")];
    return inputs.find(el => {
      if (el.offsetParent === null) return false;
      if (el.disabled || el.readOnly) return false;
      const type = (el.type || "").toLowerCase();
      if (type === "hidden" || type === "button" || type === "submit" || type === "checkbox") return false;
      return true;
    }) || null;
  }

  // =========================================================
  // NHẬP VALUE TRƠN TRU
  // =========================================================

  function setValue(input, value) {
    if (!input) return false;
    
    input.focus();
    
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  // =========================================================
  // ELEMENT CÓ HIỂN THỊ KHÔNG
  // =========================================================

  function visible(el) {
    if (!el) return false;
    if (el.offsetParent === null) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  // =========================================================
  // TEXT ELEMENT
  // =========================================================

  function textOf(el) {
    return (
      el.innerText ||
      el.textContent ||
      el.value ||
      el.getAttribute("aria-label") ||
      el.getAttribute("title") ||
      ""
    ).replace(/\s+/g, " ").trim();
  }

  // =========================================================
  // TÌM NÚT ĐỔI
  // =========================================================

  function getRedeemButton(input) {
    if (!input) return null;
    const ir = input.getBoundingClientRect();
    const candidates = [];
    const elements = [...document.querySelectorAll("button,input,[role='button'],a")];

    for (const el of elements) {
      if (!visible(el) || el.disabled || el === input) continue;
      const text = textOf(el);
      if (text !== "Đổi") continue;

      const r = el.getBoundingClientRect();
      candidates.push({
        el,
        distance: Math.abs(r.left - ir.right) + Math.abs(r.top - ir.top)
      });
    }

    candidates.sort((a, b) => a.distance - b.distance);
    return candidates.length ? candidates[0].el : null;
  }

  async function waitRedeemButton(input) {
    const start = performance.now();
    while (performance.now() - start < FIND_BUTTON_TIMEOUT) {
      const button = getRedeemButton(input);
      if (button) return button;
      await sleep(10);
    }
    return null;
  }

  function fastClick(el) {
    if (!el) return false;
    try {
      el.click();
      return true;
    } catch {
      return false;
    }
  }

  // =========================================================
  // CHỜ KẾT QUẢ (ƯU TIÊN KIỂM TRA THÀNH CÔNG TRƯỚC)
  // =========================================================

  function waitResult(timeout = RESULT_TIMEOUT) {
    return new Promise(resolve => {
      let finished = false;
      let timer;

      const finish = result => {
        if (finished) return;
        finished = true;
        observer.disconnect();
        clearTimeout(timer);
        resolve(result);
      };

      const check = () => {
        const text = document.body.innerText || "";
        const lowerText = text.toLowerCase();

        // 1. ƯU TIÊN SỐ 1: Kiểm tra thành công trước tiên
        if (
          text.includes("Đã nhận thành công") ||
          text.includes("kiểm tra hộp thư")
        ) {
          finish("success");
          return;
        }

        // 2. Kiểm tra từ khóa lỗi hoặc error hệ thống thực sự
        if (
          lowerText.includes("error") ||
          text.includes("CDKey đã nhập không hợp lệ") ||
          text.includes("Vui lòng thử lại")
        ) {
          finish("invalid");
          return;
        }
      };

      const observer = new MutationObserver(check);
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true
      });

      check();

      timer = setTimeout(() => finish("timeout"), timeout);
    });
  }

  // =========================================================
  // XỬ LÝ POPUP THÀNH CÔNG
  // =========================================================

  function getSuccessModal() {
    const elements = [...document.querySelectorAll("div,section,article")];
    return elements
      .filter(el => visible(el) && ((el.innerText || "").includes("Đã nhận thành công") || (el.innerText || "").includes("kiểm tra hộp thư")))
      .sort((a, b) => (a.innerText || "").length - (b.innerText || "").length)[0] || null;
  }

  function getCloseButton(modal) {
    if (!modal) return null;
    const labelled = [...modal.querySelectorAll("button,[role='button'],a")].find(el => {
      if (!visible(el)) return false;
      const value = (el.getAttribute("aria-label") || el.getAttribute("title") || "").toLowerCase();
      return value.includes("close") || value.includes("đóng");
    });
    if (labelled) return labelled;

    const mr = modal.getBoundingClientRect();
    const candidates = [...modal.querySelectorAll("button,[role='button'],a,div,span")].filter(el => {
      if (!visible(el)) return false;
      const r = el.getBoundingClientRect();
      return r.left > mr.left + mr.width * 0.60 && r.top < mr.top + mr.height * 0.40 && r.width >= 8 && r.height >= 8;
    });
    return candidates[0] || null;
  }

  async function closeSuccess() {
    for (let i = 0; i < 100; i++) {
      const modal = getSuccessModal();
      if (modal) {
        const close = getCloseButton(modal);
        if (close) {
          fastClick(close);
          for (let j = 0; j < 100; j++) {
            if (!getSuccessModal()) return true;
            await sleep(10);
          }
        }
      }
      await sleep(10);
    }
    return false;
  }

  // =========================================================
  // TẢI RAW CODE
  // =========================================================

  await acceptCookie();
  console.log("📥 Đang tải danh sách code...");

  let response;
  try {
    response = await fetch(SOURCE_URL + "?t=" + Date.now(), { cache: "no-store" });
  } catch (err) {
    console.error("❌ Lỗi tải RAW:", err);
    return;
  }

  if (!response.ok) {
    console.error("❌ HTTP Error:", response.status);
    return;
  }

  const raw = await response.text();
  const codes = raw
    .replace(/^\uFEFF/, "")
    .split(/\r\n|\n|\r/)
    .map(x => x.trim())
    .filter(x => x.length > 0);

  console.log(`📋 Tổng số code lấy được: ${codes.length} dòng`);

  let processed = 0;
  let success = 0;
  let invalid = 0;
  let timeout = 0;
  let noButton = 0;

  // =========================================================
  // VÒNG LẶP CHẠY CODE
  // =========================================================

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    console.log(`%c⚡ [${i + 1}/${codes.length}] Đang nhập: ${code}`, "font-weight:bold;color:#00ff88");

    let input = getInput();
    if (!input) {
      for (let j = 0; j < 50; j++) {
        input = getInput();
        if (input) break;
        await sleep(20);
      }
    }

    if (!input) {
      console.log("❌ Không tìm thấy ô input → Bỏ qua code này");
      continue;
    }

    setValue(input, "");
    await sleep(30);
    setValue(input, code);

    let redeem = await waitRedeemButton(input);
    if (!redeem) {
      await sleep(50);
      redeem = await waitRedeemButton(input);
    }

    if (!redeem) {
      console.log("⚠️ Không tìm thấy nút Đổi → Bỏ qua code này");
      noButton++;
      continue;
    }

    fastClick(redeem);

    const result = await waitResult();
    processed++;

    if (result === "success") {
      success++;
      console.log(`%c✅ THÀNH CÔNG: ${code}`, "font-weight:bold;color:#00ff00");
      await closeSuccess();
    } else if (result === "invalid") {
      invalid++;
      console.log(`❌ SAI / ERROR: ${code}`);
    } else {
      timeout++;
      console.log(`⏱ TIMEOUT: ${code}`);
    }

    const nextInput = getInput();
    if (nextInput) {
      setValue(nextInput, "");
    }

    await sleep(DELAY_BETWEEN_CODES);
  }

  // =========================================================
  // KẾT QUẢ TỔNG KẾT
  // =========================================================

  console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color:#888");
  console.log("%c🏁 HOÀN TẤT QUÉT CODE", "font-weight:bold;color:#00ff88;font-size:15px");
  console.log(`📋 Tổng code: ${codes.length}`);
  console.log(`✅ Thành công: ${success}`);
  console.log(`❌ Code sai/Error: ${invalid}`);
  console.log(`⏱ Timeout: ${timeout}`);
  console.log(`⚠️ Không thấy nút Đổi: ${noButton}`);

})();
