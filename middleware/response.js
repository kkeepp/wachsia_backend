export function ok(res, data) {
  return res.json({ success: true, data });
}

export function fail(res, error) {
  return res.json({ success: false, error });
}
