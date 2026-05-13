// Kullanıcının günlük AI kullanım limitini kontrol eder ve sayacı artırır
export const checkAiLimit = async (req, res, next) => {
  try {
    const user = req.user;

    // Önce günlük reset kontrolü
    await user.checkAndResetUsage();

    if (user.aiUsageCount >= user.aiUsageLimit) {
      return res.status(429).json({
        success: false,
        message: `Günlük yapay zeka kullanım limitinize (${user.aiUsageLimit} istek) ulaştınız. Limit yarın sıfırlanacak.`,
        code: 'AI_LIMIT_EXCEEDED',
        limit: user.aiUsageLimit,
        used: user.aiUsageCount
      });
    }

    // Sayacı artır ve kaydet
    user.aiUsageCount += 1;
    await user.save({ validateBeforeSave: false });

    // Frontend'in sayacı güncelleyebilmesi için header'a ekle
    res.setHeader('X-AI-Usage-Count', user.aiUsageCount);
    res.setHeader('X-AI-Usage-Limit', user.aiUsageLimit);

    next();
  } catch (error) {
    console.error('AI Limit Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};
