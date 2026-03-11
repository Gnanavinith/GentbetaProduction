import ApprovalGroup from "../models/ApprovalGroup.model.js";
import User from "../models/User.model.js";
import { generateCacheKey, getFromCache, setInCache, deleteFromCache } from "../utils/cache.js";

// Helper function to invalidate group cache
async function invalidateGroupCache(plantId, companyId) {
  const pages = [1, 2, 3, 4, 5];
  const limits = [10, 20, 50, 100];
  const invalidations = [];

  for (const page of pages) {
    for (const limit of limits) {
      const key = generateCacheKey("approval-groups", { page, limit, plantId });
      invalidations.push(deleteFromCache(key));
    }
  }

  try {
    await Promise.all(invalidations);
  } catch (err) {
    console.error("Cache invalidation error:", err);
  }
}

/* ======================================================
   CREATE APPROVAL GROUP
====================================================== */
export const createGroup = async (req, res) => {
  try {
    const { groupName, description, members } = req.body;
    const { userId, plantId, companyId } = req.user;

    // Validate input
    if (!groupName || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Group name and at least one member are required" 
      });
    }

    // Verify all members exist and belong to the same plant
    const validMembers = await User.find({ 
      _id: { $in: members },
      plantId: plantId,
      isActive: true 
    }).select("_id");

    if (validMembers.length !== members.length) {
      return res.status(400).json({ 
        success: false, 
        message: "One or more selected members are not valid or do not belong to your plant" 
      });
    }

    // Check if group with same name already exists
    const existingGroup = await ApprovalGroup.findOne({ 
      groupName, 
      plantId, 
      companyId,
      isActive: true 
    });

    if (existingGroup) {
      return res.status(400).json({ 
        success: false, 
        message: "A group with this name already exists" 
      });
    }

    // Create the group
    const group = await ApprovalGroup.create({
      groupName,
      description,
      members: validMembers.map(m => m._id),
      companyId,
      plantId,
      createdBy: userId
    });

    // Populate members for response
    const populatedGroup = await ApprovalGroup.findById(group._id)
      .populate("members", "name email role")
      .populate("createdBy", "name email");

    // Invalidate cache
    invalidateGroupCache(plantId, companyId);

    res.status(201).json({ 
      success: true, 
      message: "Approval group created successfully", 
      data: populatedGroup 
    });

  } catch (error) {
    console.error("Create approval group error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create approval group",
      error: error.message 
    });
  }
};

/* ======================================================
   GET ALL APPROVAL GROUPS
====================================================== */
export const getGroups = async (req, res) => {
  try {
    const { plantId, companyId } = req.user;
    const { page = 1, limit = 20 } = req.query;

    // Generate cache key
    const cacheKey = generateCacheKey("approval-groups", { page, limit, plantId });

    // Try cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const skip = (page - 1) * limit;

    const [total, groups] = await Promise.all([
      ApprovalGroup.countDocuments({ 
        plantId, 
        companyId, 
        isActive: true 
      }),
      ApprovalGroup.find({ 
        plantId, 
        companyId, 
        isActive: true 
      })
        .populate("members", "name email role profileImage")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
    ]);

    const result = {
      success: true,
      data: groups,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };

    await setInCache(cacheKey, result, 300);
    res.json(result);

  } catch (error) {
    console.error("Get approval groups error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch approval groups" 
    });
  }
};

/* ======================================================
   GET SINGLE APPROVAL GROUP
====================================================== */
export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const { plantId, companyId } = req.user;

    const group = await ApprovalGroup.findOne({ 
      _id: id, 
      plantId, 
      companyId, 
      isActive: true 
    })
      .populate("members", "name email role profileImage isActive")
      .populate("createdBy", "name email")
      .lean();

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Approval group not found" 
      });
    }

    res.json({ 
      success: true, 
      data: group 
    });

  } catch (error) {
    console.error("Get approval group error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch approval group" 
    });
  }
};

/* ======================================================
   UPDATE APPROVAL GROUP
====================================================== */
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupName, description, members } = req.body;
    const { plantId, companyId } = req.user;

    // Find the group
    const group = await ApprovalGroup.findOne({ 
      _id: id, 
      plantId, 
      companyId, 
      isActive: true 
    });

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Approval group not found" 
      });
    }

    // Validate members if provided
    let finalMembers = group.members;
    if (members && Array.isArray(members)) {
      if (members.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Group must have at least one member" 
        });
      }

      const validMembers = await User.find({ 
        _id: { $in: members },
        plantId: plantId,
        isActive: true 
      }).select("_id");

      if (validMembers.length !== members.length) {
        return res.status(400).json({ 
          success: false, 
          message: "One or more selected members are not valid" 
        });
      }

      finalMembers = validMembers.map(m => m._id);
    }

    // Update the group
    const updated = await ApprovalGroup.findByIdAndUpdate(
      id,
      {
        ...(groupName && { groupName }),
        ...(description !== undefined && { description }),
        members: finalMembers
      },
      { new: true }
    )
      .populate("members", "name email role")
      .populate("createdBy", "name email");

    // Invalidate cache
    invalidateGroupCache(plantId, companyId);

    res.json({ 
      success: true, 
      message: "Approval group updated successfully", 
      data: updated 
    });

  } catch (error) {
    console.error("Update approval group error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update approval group" 
    });
  }
};

/* ======================================================
   DELETE APPROVAL GROUP (SOFT DELETE)
====================================================== */
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { plantId, companyId } = req.user;

    const group = await ApprovalGroup.findOne({ 
      _id: id, 
      plantId, 
      companyId, 
      isActive: true 
    });

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Approval group not found" 
      });
    }

    // Soft delete
    await ApprovalGroup.findByIdAndUpdate(id, { 
      isActive: false 
    });

    // Invalidate cache
    invalidateGroupCache(plantId, companyId);

    res.json({ 
      success: true, 
      message: "Approval group deleted successfully" 
    });

  } catch (error) {
    console.error("Delete approval group error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete approval group" 
    });
  }
};

/* ======================================================
   GET GROUPS WHERE USER IS A MEMBER
====================================================== */
export const getGroupsByMember = async (req, res) => {
  try {
    const userId = req.user.userId;

    const groups = await ApprovalGroup.find({
      members: userId,
      isActive: true
    })
      .populate("members", "name email role")
      .populate("createdBy", "name email")
      .lean();

    res.json({ 
      success: true, 
      data: groups 
    });

  } catch (error) {
    console.error("Get user groups error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch user groups" 
    });
  }
};
