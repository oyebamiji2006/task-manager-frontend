export const requestNotificationPermission = () => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
};

export const showBrowserNotification = (title, body) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.svg" });
  }
};

export const playAlertSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1);
  } catch (e) {}
};

export const checkTaskAlerts = (tasks, alertedTasksRef, onAlert) => {
  const now = new Date();
  tasks.forEach((task) => {
    if (task.status === "completed") return;
    if (!task.dueDate) return;

    const due = new Date(task.dueDate);
    const diffMinutes = (due - now) / (1000 * 60);
    const dueSoonKey = `${task._id}-due-soon`;
    const overdueKey = `${task._id}-overdue`;

    if (diffMinutes > 0 && diffMinutes <= 10 && !alertedTasksRef.current.has(dueSoonKey)) {
      alertedTasksRef.current.add(dueSoonKey);
      const message = `"${task.title}" is due in ${Math.ceil(diffMinutes)} minute(s)`;
      showBrowserNotification("⏰ Task Due Soon", message);
      playAlertSound();
      onAlert({ type: "due-soon", task, message });
    }

    if (diffMinutes <= 0 && diffMinutes >= -60 && !alertedTasksRef.current.has(overdueKey)) {
      alertedTasksRef.current.add(overdueKey);
      const message = `"${task.title}" is overdue and not completed`;
      showBrowserNotification("🚨 Task Overdue", message);
      playAlertSound();
      onAlert({ type: "overdue", task, message });
    }
  });
};