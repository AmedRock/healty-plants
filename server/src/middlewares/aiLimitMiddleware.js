// [MİMARİ] Business Logic Middleware: AI Limit Denetleyicisi
// Bu middleware, veritabanı ile konuşup kullanıcının günlük kota sınırını aşmasını engeller. Rate limiter'dan farkı: Saatlik/IP bazlı değil, Veritabanı ve Kullanıcı (User) bazlıdır.
export const checkAiLimit = async (req, res, next) => {
  try {
    const user = req.user;

    // [MİMARİ] Lazy Evaluation ile Reset
    // Ayrı bir Cron Job kullanmak yerine, istek geldiğinde tarih kontrolü yapar. Eğer geçmişse (dün kullanıldıysa) hakları 0'lar.
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

    // [MİMARİ] Optimistic Locking/Save
    // validateBeforeSave: false yapılarak, diğer şema gereksinimlerini kontrol etmeden hızlıca sadece sayacı (count) günceller.
    user.aiUsageCount += 1;
    await user.save({ validateBeforeSave: false });

    // [MİMARİ] Custom HTTP Headers (Header Injection)
    // İstemcinin (frontend) profil ekranında kullanıcının kalan hakkını gösterebilmesi için bu bilgiyi HTTP yanıt başlıklarına (headers) gömüyoruz.
    res.setHeader('X-AI-Usage-Count', user.aiUsageCount);
    res.setHeader('X-AI-Usage-Limit', user.aiUsageLimit);

    next();
  } catch (error) {
    console.error('AI Limit Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};
