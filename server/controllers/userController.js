import User from '../models/User.js';
import { success, fail } from '../utils/apiResponse.js';
import { fromMulterFile } from '../services/imageStorage.js';

export async function updateMe(req, res, next) {
  try {
    const { name, phone, locationLabel, lng, lat } = req.body;
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (locationLabel) req.user.locationLabel = locationLabel;
    if (lng && lat) {
      req.user.location = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
    }
    if (req.file) req.user.profileImage = fromMulterFile(req.file);
    await req.user.save();
    return success(res, 'Profile updated', { user: req.user.toPublic() });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return fail(res, 'User not found', 404);
    return success(res, 'User', { user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}
