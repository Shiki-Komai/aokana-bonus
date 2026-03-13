const AUTH_ID = "JVMUNHRA3M";
const AUTH_PASSWORD = "UGOZN2TSL1";
const ACCESS_LEVEL = 2;

const loginView = document.getElementById("loginView");
const appShell = document.getElementById("appShell");
const form = document.getElementById("loginForm");
const authInput = document.getElementById("authId");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");

const userNameEl = document.getElementById("userName");
const accessBadge = document.getElementById("accessBadge");
const accessLevelText = document.getElementById("accessLevelText");
const accessLevelLabel = document.getElementById("accessLevelLabel");
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const logoutConfirm = document.getElementById("logoutConfirm");
const logoutCancel = document.getElementById("logoutCancel");
const splash = document.getElementById("splash");
const menuToggle = document.getElementById("menuToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const views = Array.from(document.querySelectorAll(".view"));
const navLinks = Array.from(document.querySelectorAll(".nav-link"));

const reportRows = Array.from(document.querySelectorAll(".report-row"));
const reportTag = document.getElementById("reportTag");
const reportTitle = document.getElementById("reportTitle");
const reportDownloadArea = document.getElementById("reportDownloadArea");
const reportMeta = document.getElementById("reportMeta");
const reportSummary = document.getElementById("reportSummary");
const reportBody = document.getElementById("reportBody");
const backToReports = document.getElementById("backToReports");
const latestItems = Array.from(document.querySelectorAll(".latest-item"));
const noticeItems = Array.from(document.querySelectorAll(".notice-item"));
const noticeTitle = document.getElementById("noticeTitle");
const noticeBody = document.getElementById("noticeBody");
const backToDashboard = document.getElementById("backToDashboard");
const backToMembers = document.getElementById("backToMembers");
const createReportBtn = document.getElementById("createReportBtn");
const saveReport = document.getElementById("saveReport");

const memberLinks = Array.from(document.querySelectorAll(".member-link"));

const accessModal = document.getElementById("accessModal");
const accessModalCard = document.querySelector("#accessModal .modal-card");
const accessModalTitle = document.getElementById("accessModalTitle");
const accessModalMessage = document.getElementById("accessModalMessage");
const accessModalQuestion = document.getElementById("accessModalQuestion");
const accessModalActions = document.getElementById("accessModalActions");
const accessModalYes = document.getElementById("accessModalYes");
const accessModalNo = document.getElementById("accessModalNo");

const emergencyModal = document.getElementById("emergencyModal");
const logoutCountdown = document.getElementById("logoutCountdown");
const downloadModal = document.getElementById("downloadModal");
const downloadClose = document.getElementById("downloadClose");
const submitApplication = document.getElementById("submitApplication");
const supervisorName = document.getElementById("supervisorName");
const applyAuthId = document.getElementById("applyAuthId");
const applyDept = document.getElementById("applyDept");
const applyReason = document.getElementById("applyReason");
const reportTitleInput = document.getElementById("reportTitleInput");
const reportDate = document.getElementById("reportDate");
const reportBodyInput = document.getElementById("reportBodyInput");

let applicationTimer = null;
let emergencyTimer = null;
let accessModalYesHandler = null;
let currentMemberName = null;
let accessModalAfterClose = null;
let approvalMode = null;
let countdownTimer = null;
let autofillRunning = false;
let typingTimer = null;

function typeText(target, value, delay = 35) {
  target.value = "";
  target.classList.add("typing");
  return new Promise((resolve) => {
    let index = 0;
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
    typingTimer = setInterval(() => {
      target.value += value[index];
      index += 1;
      if (index >= value.length) {
        clearInterval(typingTimer);
        typingTimer = null;
        target.classList.remove("typing");
        resolve();
      }
    }, delay);
  });
}

async function autofill() {
  if (autofillRunning) return;
  autofillRunning = true;
  await typeText(authInput, AUTH_ID, 30);
  await typeText(passwordInput, AUTH_PASSWORD, 30);
  autofillRunning = false;
}

function setSession() {
  sessionStorage.setItem("sdb_auth", "true");
  sessionStorage.setItem("sdb_user", `SDB_User_${AUTH_ID}`);
  sessionStorage.setItem("sdb_access", String(ACCESS_LEVEL));
}

function getSession() {
  return {
    auth: sessionStorage.getItem("sdb_auth") === "true",
    user: sessionStorage.getItem("sdb_user") || "SDB_User",
    access: Number(sessionStorage.getItem("sdb_access")) || 0,
  };
}

function showApp() {
  const session = getSession();
  userNameEl.textContent = session.user;
  if (accessBadge) {
    accessBadge.textContent = `ACCESS LEVEL ${session.access}`;
  }
  if (accessLevelText) {
    accessLevelText.textContent = `ACCESS LEVEL ${session.access}`;
  }
  if (accessLevelLabel) {
    accessLevelLabel.textContent = `アクセスレベル：${session.access}`;
  }
  loginView.classList.add("hidden");
  appShell.classList.remove("hidden");
  hideSplash();
  switchView("dashboard");
}

function showLogin() {
  loginView.classList.remove("hidden");
  appShell.classList.add("hidden");
  clearApplicationForm();
  clearReportForm();
  showSplash(() => {
    autofill();
    authInput.focus();
  });
}

function switchView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("hidden", view.id !== `view-${viewId}`);
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === viewId);
  });

  if (viewId !== "application") {
    clearApplicationTimer();
    clearApplicationForm();
  }
  if (viewId !== "report-create") {
    clearReportForm();
  }
}

function renderReportDetail(row, accessLevel) {
  const requiredLevel = Number(row.dataset.level);
  reportTag.textContent = `CLEARANCE L${requiredLevel}`;
  reportMeta.textContent = `Status: ${row.dataset.status}`;
  if (reportDownloadArea) {
    reportDownloadArea.innerHTML = "";
  }

  if (requiredLevel >= 3) {
    reportTitle.innerHTML = "<span class='redact-inline'>REDACTED</span>";
    reportSummary.textContent = "アクセスレベルが足りないため、本レポートを閲覧することはできません。";
    reportBody.innerHTML = "<div class='redact-block'>REDACTED</div>";
    return;
  }

  reportTitle.textContent = `${row.dataset.id} ${row.dataset.title}`;

  if (accessLevel < requiredLevel) {
    reportSummary.textContent = "このレポートは現在のアクセスレベルでは閲覧できません。";
    reportBody.innerHTML = "<div class='redact-block'>ACCESS DENIED</div>";
    return;
  }

  reportSummary.textContent = row.dataset.summary;
  reportBody.innerHTML = row.dataset.body;

  if (reportDownloadArea) {
    if (row.dataset.id === "SDB-IR-2041") {
      const fileName = "SDB-IR-2041_HFOIJ7H9JL.pdf";
      const filePath = "assets/files/SDB-IR-2041_HFOIJ7H9JL.pdf";
      const link = document.createElement("a");
      link.className = "secondary-btn small-btn";
      link.textContent = "ダウンロード";
      link.href = encodeURI(filePath);
      link.setAttribute("download", fileName);
      link.addEventListener("click", () => {
        if (downloadModal) downloadModal.classList.add("open");
      });
      reportDownloadArea.appendChild(link);
    } else if (row.dataset.id === "SDB-IR-8872") {
      const note = document.createElement("span");
      note.className = "footer-note";
      note.textContent = "該当レポートはまだ提出されていません";
      reportDownloadArea.appendChild(note);
    }
  }
}

function openAccessModal({ title, message, question, allowApply }) {
  if (accessModalTitle) {
    accessModalTitle.textContent = title || "アクセス権限がありません";
  }
  accessModalMessage.textContent = message;
  accessModalQuestion.classList.toggle("hidden", !question);
  accessModalActions.classList.remove("hidden");
  accessModalYes.classList.toggle("hidden", !allowApply);
  accessModalNo.textContent = question ? "いいえ" : "閉じる";
  accessModal.classList.add("open");
  if (accessModalCard) {
    accessModalCard.classList.remove("compact");
  }
}

function closeAccessModal() {
  accessModal.classList.remove("open");
  accessModalYesHandler = null;
  approvalMode = null;
  if (accessModalAfterClose) {
    const callback = accessModalAfterClose;
    accessModalAfterClose = null;
    callback();
  }
}

function openEmergencyModal() {
  emergencyModal.classList.add("open");
}

function closeEmergencyModal() {
  emergencyModal.classList.remove("open");
}

function clearApplicationTimer() {
  if (applicationTimer) {
    clearTimeout(applicationTimer);
    applicationTimer = null;
  }
  if (emergencyTimer) {
    clearTimeout(emergencyTimer);
    emergencyTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  closeEmergencyModal();
}

function triggerEmergencyLogout() {
  clearApplicationTimer();
  closeAccessModal();
  openEmergencyModal();
  let remaining = 5;
  if (logoutCountdown) {
    logoutCountdown.textContent = String(remaining);
  }
  countdownTimer = setInterval(() => {
    remaining -= 1;
    if (logoutCountdown) {
      logoutCountdown.textContent = String(Math.max(remaining, 0));
    }
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
  emergencyTimer = setTimeout(() => {
    sessionStorage.clear();
    closeEmergencyModal();
    showLogin();
    autofill();
  }, 5000);
}

function startApplicationTimer() {
  clearApplicationTimer();
  applicationTimer = setTimeout(() => {
    clearApplicationForm();
    triggerEmergencyLogout();
  }, 30000);
}

function clearApplicationForm() {
  [supervisorName, applyAuthId, applyDept, applyReason].forEach((field) => {
    if (field) field.value = "";
  });
}

function clearReportForm() {
  [reportTitleInput, reportDate, reportBodyInput].forEach((field) => {
    if (field) field.value = "";
  });
}

function showSplash(onComplete) {
  if (!splash) return;
  document.body.classList.add("splash-active");
  splash.classList.remove("hide");
  splash.classList.add("show");
  const endSplash = () => {
    splash.classList.add("hide");
    document.body.classList.remove("splash-active");
    if (onComplete) onComplete();
  };
  splash.addEventListener("click", endSplash, { once: true });
  setTimeout(endSplash, 5000);
}

function hideSplash() {
  if (!splash) return;
  splash.classList.add("hide");
  splash.classList.remove("show");
  document.body.classList.remove("splash-active");
}

window.addEventListener("load", () => {
  const session = getSession();
  if (session.auth) {
    showApp();
  } else {
    showLogin();
  }
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const idValue = authInput.value.trim();
    const passValue = passwordInput.value.trim();

    if (idValue === AUTH_ID && passValue === AUTH_PASSWORD) {
      setSession();
      showApp();
      return;
    }

    errorMessage.textContent = "認証に失敗しました。入力内容を確認してください。";
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const viewId = link.dataset.view;
    const session = getSession();

    if (viewId === "missions" && session.access < 3) {
      openAccessModal({
        title: "アクセス権限がありません",
        message: "アクセス権限がありません。",
        question: false,
        allowApply: false,
      });
      return;
    }

    if (viewId === "settings") {
      triggerEmergencyLogout();
      return;
    }

    if (viewId === "manual") {
      triggerEmergencyLogout();
      return;
    }

    switchView(viewId);
    document.body.classList.remove("mobile-menu-open");
  });
});

logoutBtn.addEventListener("click", () => {
  if (logoutModal) logoutModal.classList.add("open");
});

if (logoutCancel) {
  logoutCancel.addEventListener("click", () => {
    if (logoutModal) logoutModal.classList.remove("open");
  });
}

if (logoutConfirm) {
  logoutConfirm.addEventListener("click", () => {
    if (logoutModal) logoutModal.classList.remove("open");
    sessionStorage.clear();
    showLogin();
  });
}

if (downloadClose) {
  downloadClose.addEventListener("click", () => {
    if (downloadModal) downloadModal.classList.remove("open");
  });
}

reportRows.forEach((row) => {
  const session = getSession();
  const requiredLevel = Number(row.dataset.level);
  if (session.access < requiredLevel) {
    row.classList.add("locked");
  } else {
    row.classList.remove("locked");
  }
  if (requiredLevel >= 3) {
    row.classList.add("level3");
    const cells = row.querySelectorAll("td");
    if (cells[0]) cells[0].classList.add("cell-redact");
    if (cells[1]) cells[1].classList.add("cell-redact");
  }

  row.addEventListener("click", () => {
    reportRows.forEach((r) => r.classList.remove("active"));
    row.classList.add("active");
    const current = getSession();
    renderReportDetail(row, current.access);
    switchView("report-detail");
  });
});

memberLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const name = link.dataset.name;
    currentMemberName = name;
    if (name === "迦楼羅") {
      openAccessModal({
        title: "警告",
        message: "対象の閲覧権限は最高機密となります。閲覧許可を申請できるのはアクセスレベル5以上の職員のみです",
        question: false,
        allowApply: false,
      });
      return;
    }

    openAccessModal({
      title: "アクセス権限がありません",
      message: "対象のプロフィールを閲覧する権限がありません。",
      question: true,
      allowApply: true,
    });
    accessModalYes.textContent = "はい";
    accessModalYesHandler = () => {
      closeAccessModal();
      switchView("application");
      if (currentMemberName !== "伊那守常葉") {
        startApplicationTimer();
      }
    };
  });
});

accessModalNo.addEventListener("click", () => {
  closeAccessModal();
});

accessModalYes.addEventListener("click", () => {
  if (accessModalYesHandler) {
    accessModalYesHandler();
  }
});

if (submitApplication) {
  submitApplication.addEventListener("click", () => {
    const fields = [supervisorName, applyAuthId, applyDept, applyReason];
    const hasEmpty = fields.some((field) => !field || !field.value.trim());
    if (hasEmpty) {
      openAccessModal({
        title: "注意",
        message: "必要事項が記入されていません。",
        question: false,
        allowApply: false,
      });
      return;
    }

    openAccessModal({
      title: "注意",
      message: "申請内容に不明点がある場合、担当者より直接ご連絡させていただくことがあります",
      question: false,
      allowApply: true,
    });
    accessModalYes.textContent = "承諾";
    accessModalYesHandler = () => {
      closeAccessModal();
      if (currentMemberName === "伊那守常葉") {
        approvalMode = "member-approval";
        openAccessModal({
          title: "通知",
          message: "センターに申請中です",
          question: false,
          allowApply: false,
        });
        if (accessModalCard) accessModalCard.classList.add("compact");
        setTimeout(() => {
          if (approvalMode !== "member-approval") return;
          openAccessModal({
            title: "通知",
            message: "申請が許可されました",
            question: false,
            allowApply: false,
          });
          if (accessModalCard) accessModalCard.classList.add("compact");
          setTimeout(() => {
            if (approvalMode !== "member-approval") return;
            closeAccessModal();
            clearApplicationForm();
            switchView("profile");
          }, 2000);
        }, 3000);
        return;
      }

      triggerEmergencyLogout();
    };
  });
}

if (backToReports) {
  backToReports.addEventListener("click", () => {
    switchView("reports");
  });
}

if (createReportBtn) {
  createReportBtn.addEventListener("click", () => {
    switchView("report-create");
  });
}

if (saveReport) {
  saveReport.addEventListener("click", () => {
    const fields = [reportTitleInput, reportDate, reportBodyInput];
    const hasEmpty = fields.some((field) => !field || !field.value.trim());
    if (hasEmpty) {
      openAccessModal({
        title: "注意",
        message: "必要事項が記入されていません。",
        question: false,
        allowApply: false,
      });
      return;
    }

    openAccessModal({
      title: "確認",
      message: "提出しますか",
      question: false,
      allowApply: true,
    });
    accessModalYes.textContent = "提出";
    accessModalNo.textContent = "閉じる";
    accessModalYesHandler = () => {
      clearReportForm();
      closeAccessModal();
      triggerEmergencyLogout();
    };
  });
}

latestItems.forEach((item) => {
  item.addEventListener("click", () => {
    const targetId = item.dataset.reportId;
    const row = reportRows.find((r) => r.dataset.id === targetId);
    if (row) {
      renderReportDetail(row, getSession().access);
      switchView("report-detail");
    }
  });

  const targetId = item.dataset.reportId;
  const row = reportRows.find((r) => r.dataset.id === targetId);
  if (row && Number(row.dataset.level) >= 3) {
    item.classList.add("latest-redact");
  }
});

noticeItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (noticeTitle) noticeTitle.textContent = item.dataset.title;
    if (noticeBody) noticeBody.textContent = item.dataset.body;
    switchView("notice-detail");
  });
});

if (backToDashboard) {
  backToDashboard.addEventListener("click", () => {
    switchView("dashboard");
  });
}

if (backToMembers) {
  backToMembers.addEventListener("click", () => {
    switchView("members");
  });
}

if (reportRows.length) {
  const session = getSession();
  renderReportDetail(reportRows[0], session.access);
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    document.body.classList.toggle("mobile-menu-open");
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => {
    document.body.classList.remove("mobile-menu-open");
  });
}
