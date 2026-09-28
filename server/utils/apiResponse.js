export function success(res, message, data = null, status = 200) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(status).json(payload);
}

export function fail(res, message, status = 400, extra = null) {
  const payload = { success: false, message };
  if (extra) Object.assign(payload, extra);
  return res.status(status).json(payload);
}
