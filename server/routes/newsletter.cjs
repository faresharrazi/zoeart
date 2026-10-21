const express = require("express");
const {
  NewsletterService,
  DatabaseService,
} = require("../services/database.cjs");
const { authenticateToken } = require("../middleware/auth.cjs");
const { asyncHandler, ValidationError, NotFoundError } = require("../middleware/errorHandler.cjs");

const router = express.Router();

// Get all newsletter subscribers (admin only)
router.get("/", authenticateToken, asyncHandler(async (req, res) => {
  const subscribers = await NewsletterService.getAll();
  res.json(subscribers);
}));

// Get single subscriber (admin only)
router.get("/:id", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscriber = await NewsletterService.getById(id);
  
  if (!subscriber) {
    throw new NotFoundError("Subscriber not found");
  }

  res.json(subscriber);
}));

// Subscribe to newsletter (public)
router.post("/subscribe", asyncHandler(async (req, res) => {
  const { email, name, source = "website" } = req.body;

  if (!email) {
    throw new ValidationError("Email is required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || email.length > 100 || !emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
  if (name && (typeof name !== "string" || name.length > 100)) {
    throw new ValidationError("Name must be at most 100 characters");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await NewsletterService.findOne("newsletter_subscribers", {
    email: normalizedEmail,
  });

  if (existing && existing.status === "active") {
    return res.status(409).json({
      error: "Email already subscribed",
      message: "This email is already subscribed to our newsletter"
    });
  }

  // New subscriber, or someone who unsubscribed and is coming back
  const subscriber = existing
    ? await NewsletterService.update(existing.id, {
        status: "active",
        name: name || existing.name,
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
      })
    : await NewsletterService.create({
        email: normalizedEmail,
        name: name || null,
        source: String(source).slice(0, 50),
        subscribed_at: new Date().toISOString(),
        status: "active",
      });

  res.status(201).json({
    success: true,
    message: "Successfully subscribed to newsletter",
    subscriber: {
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name,
      subscribed_at: subscriber.subscribed_at,
    }
  });
}));

// Unsubscribe from newsletter (public)
router.post("/unsubscribe", asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError("Email is required");
  }

  const subscriber = await NewsletterService.findOne("newsletter_subscribers", {
    email: String(email).toLowerCase().trim(),
  });

  if (!subscriber) {
    return res.status(404).json({ 
      error: "Email not found",
      message: "This email is not subscribed to our newsletter"
    });
  }

  await NewsletterService.update(subscriber.id, { 
    status: "unsubscribed",
    unsubscribed_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Successfully unsubscribed from newsletter"
  });
}));

// Delete subscriber (admin only)
router.delete("/:id", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const subscriber = await NewsletterService.delete(id);
  
  if (!subscriber) {
    throw new NotFoundError("Subscriber not found");
  }

  res.json({ message: "Subscriber deleted successfully" });
}));

// Get subscriber statistics (admin only)
router.get("/stats/summary", authenticateToken, asyncHandler(async (req, res) => {
  const stats = await DatabaseService.execute(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
      COUNT(CASE WHEN status = 'unsubscribed' THEN 1 END) as unsubscribed,
      COUNT(CASE WHEN subscribed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days
    FROM newsletter_subscribers
  `);

  res.json(stats[0]);
}));

// Export subscribers (admin only)
router.get("/export/csv", authenticateToken, asyncHandler(async (req, res) => {
  const subscribers = await NewsletterService.getAll();
  
  // Quote every field, and neutralise values a spreadsheet would run as a
  // formula (subscribers choose their own name and email).
  const csvField = (value) => {
    let text = value == null ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csvHeader = "Email,Name,Status,Subscribed At,Source\n";
  const csvData = subscribers
    .map((sub) =>
      [sub.email, sub.name, sub.status, sub.subscribed_at?.toISOString?.() ?? sub.subscribed_at, sub.source]
        .map(csvField)
        .join(",")
    )
    .join("\n");
  
  const csv = csvHeader + csvData;
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
}));

module.exports = router;
