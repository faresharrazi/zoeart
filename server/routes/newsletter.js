const express = require("express");
const { NewsletterService } = require("../services/database");
const { authenticateToken } = require("../middleware/auth");
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../middleware/errorHandler");

const router = express.Router();

// Get all newsletter subscribers (admin only)
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const subscribers = await NewsletterService.getAll();
    res.json(subscribers);
  })
);

// Get single subscriber (admin only)
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const subscriber = await NewsletterService.getById(id);

    if (!subscriber) {
      throw new NotFoundError("Subscriber not found");
    }

    res.json(subscriber);
  })
);

// Subscribe to newsletter (public)
router.post(
  "/subscribe",
  asyncHandler(async (req, res) => {
    const { email, name, source = "website" } = req.body;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    // Check if email already exists
    const existing = await NewsletterService.findOne("newsletter_subscribers", {
      email,
    });

    if (existing) {
      return res.status(409).json({
        error: "Email already subscribed",
        message: "This email is already subscribed to our newsletter",
      });
    }

    const subscriberData = {
      email: email.toLowerCase().trim(),
      name: name || null,
      source: source,
      subscribed_at: new Date().toISOString(),
      status: "active",
    };

    const subscriber = await NewsletterService.create(subscriberData);

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter",
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
        subscribed_at: subscriber.subscribed_at,
      },
    });
  })
);

// Unsubscribe from newsletter (public)
router.post(
  "/unsubscribe",
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    const subscriber = await NewsletterService.findOne(
      "newsletter_subscribers",
      { email }
    );

    if (!subscriber) {
      return res.status(404).json({
        error: "Email not found",
        message: "This email is not subscribed to our newsletter",
      });
    }

    await NewsletterService.update("newsletter_subscribers", subscriber.id, {
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  })
);

// Delete subscriber (admin only)
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subscriber = await NewsletterService.delete(id);

    if (!subscriber) {
      throw new NotFoundError("Subscriber not found");
    }

    res.json({ message: "Subscriber deleted successfully" });
  })
);

// Get subscriber statistics (admin only)
router.get(
  "/stats/summary",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const stats = await NewsletterService.execute(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
      COUNT(CASE WHEN status = 'unsubscribed' THEN 1 END) as unsubscribed,
      COUNT(CASE WHEN subscribed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days
    FROM newsletter_subscribers
  `);

    res.json(stats[0]);
  })
);

// Export subscribers (admin only)
router.get(
  "/export/csv",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const subscribers = await NewsletterService.getAll();

    // Convert to CSV format
    const csvHeader = "Email,Name,Status,Subscribed At,Source\n";
    const csvData = subscribers
      .map(
        (sub) =>
          `"${sub.email}","${sub.name || ""}","${sub.status}","${
            sub.subscribed_at
          }","${sub.source || ""}"`
      )
      .join("\n");

    const csv = csvHeader + csvData;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="newsletter-subscribers-${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );
    res.send(csv);
  })
);

module.exports = router;
