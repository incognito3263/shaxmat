"""Static site pages (legal / info) served as JSON for the SPA."""
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api", tags=["site"])

# slug -> lang -> { title, body }
_PAGES: dict[str, dict[str, dict[str, str]]] = {
    "support": {
        "en": {
            "title": "Support",
            "body": "Need help with SHAXMAT+? Contact us at support@example.com.\n\nWe respond to account, gameplay, and technical issues.",
        },
        "uz": {
            "title": "Yordam",
            "body": "SHAXMAT+ bo'yicha yordam kerakmi? support@example.com manziliga yozing.\n\nHisob, o'yin va texnik masalalar bo'yicha javob beramiz.",
        },
        "ru": {
            "title": "Поддержка",
            "body": "Нужна помощь по SHAXMAT+? Напишите на support@example.com.\n\nМы отвечаем по вопросам аккаунта, игры и техники.",
        },
    },
    "language": {
        "en": {
            "title": "Language",
            "body": "Use the sidebar (bottom left): open Settings and choose UZ, RU, or EN.\n\nYour preference is saved in the browser.",
        },
        "uz": {
            "title": "Til",
            "body": "Chap panelda pastki sozlamalar: UZ, RU yoki EN ni tanlang.\n\nTanlov brauzerda saqlanadi.",
        },
        "ru": {
            "title": "Язык",
            "body": "Выберите язык в боковой панели: настройки внизу слева — UZ, RU или EN.\n\nВыбор сохраняется в браузере.",
        },
    },
    "about": {
        "en": {
            "title": "About SHAXMAT+",
            "body": "SHAXMAT+ is a 10×8 chess variant with the unique Supplier piece.\n\nPlay online, against AI, or with friends.",
        },
        "uz": {
            "title": "SHAXMAT+ haqida",
            "body": "SHAXMAT+ — Ta'minotchi donasi bilan 10×8 o'lchamdagi shaxmat.\n\nOnlayn, SI yoki do'stlar bilan o'ynang.",
        },
        "ru": {
            "title": "О SHAXMAT+",
            "body": "SHAXMAT+ — шахматы 10×8 с фигурой Поставщик.\n\nИграйте онлайн, с ИИ или с друзьями.",
        },
    },
    "jobs": {
        "en": {
            "title": "Jobs",
            "body": "We are not hiring at the moment.\n\nFollow our channels for future openings.",
        },
        "uz": {
            "title": "Vakansiyalar",
            "body": "Hozircha ochiq lavozimlar yo'q.\n\nKelajakdagi e'lonlar uchun ijtimoiy tarmoqlarni kuzating.",
        },
        "ru": {
            "title": "Вакансии",
            "body": "Сейчас открытых вакансий нет.\n\nСледите за нашими каналами.",
        },
    },
    "developers": {
        "en": {
            "title": "Developers",
            "body": "API documentation is available for partners on request.\n\nContact developers@example.com for integration and webhooks.",
        },
        "uz": {
            "title": "Dasturchilar",
            "body": "API hujjatlari hamkorlar uchun so'rov bo'yicha.\n\nIntegratsiya uchun developers@example.com.",
        },
        "ru": {
            "title": "Разработчикам",
            "body": "Документация API для партнёров — по запросу.\n\nИнтеграция: developers@example.com.",
        },
    },
    "terms": {
        "en": {
            "title": "User Agreement",
            "body": "By using SHAXMAT+ you agree to play fairly and follow community rules.\n\nAccounts may be limited for abuse or cheating.",
        },
        "uz": {
            "title": "Foydalanish shartlari",
            "body": "SHAXMAT+ dan foydalanish bilan jamoa qoidalariga rioya qilasiz.\n\nHaqorat yoki firibgarlik uchun cheklovlar qo'llanishi mumkin.",
        },
        "ru": {
            "title": "Пользовательское соглашение",
            "body": "Используя SHAXMAT+, вы соглашаетесь с правилами сообщества.\n\nЗа нарушения возможны ограничения.",
        },
    },
    "privacy": {
        "en": {
            "title": "Privacy Policy",
            "body": "We process account data needed to run the service (username, game history).\n\nWe do not sell personal data.",
        },
        "uz": {
            "title": "Maxfiylik siyosati",
            "body": "Xizmat uchun kerakli ma'lumotlarni qayta ishlaymiz (foydalanuvchi nomi, o'yinlar tarixi).\n\nShaxsiy ma'lumotlarni sotmaymiz.",
        },
        "ru": {
            "title": "Политика конфиденциальности",
            "body": "Обрабатываем данные, нужные для сервиса (ник, история партий).\n\nПерсональные данные не продаём.",
        },
    },
    "privacy-settings": {
        "en": {
            "title": "Privacy Settings",
            "body": "Manage visibility and notifications in your profile and sidebar.\n\nClear local storage in the browser to reset preferences.",
        },
        "uz": {
            "title": "Maxfiylik sozlamalari",
            "body": "Profil va yon panelda bildirishnomalar va ko'rinishni boshqaring.\n\nBrauzer xotirasini tozalash sozlamalarni tiklaydi.",
        },
        "ru": {
            "title": "Настройки конфиденциальности",
            "body": "Управляйте уведомлениями в профиле и боковой панели.\n\nОчистка хранилища браузера сбрасывает настройки.",
        },
    },
    "fair-play": {
        "en": {
            "title": "Fair Play",
            "body": "Cheating, engine use in rated games, and harassment are prohibited.\n\nReports are reviewed by moderators.",
        },
        "uz": {
            "title": "Adolatli o'yin",
            "body": "Reytingda dasturiy ta'minot yoki haqorat taqiqlanadi.\n\nShikoyatlar ko'rib chiqiladi.",
        },
        "ru": {
            "title": "Честная игра",
            "body": "Запрещены читы, движок в рейтинговых партиях и оскорбления.\n\nЖалобы рассматриваются модераторами.",
        },
    },
    "partners": {
        "en": {
            "title": "Partners",
            "body": "We work with federations and education partners.\n\nWrite to partners@example.com for collaboration.",
        },
        "uz": {
            "title": "Hamkorlar",
            "body": "Federatsiyalar va ta'lim tashkilotlari bilan hamkorlik qilamiz.\n\nHamkorlik uchun partners@example.com.",
        },
        "ru": {
            "title": "Партнёры",
            "body": "Сотрудничаем с федерациями и образовательными проектами.\n\nПартнёрство: partners@example.com.",
        },
    },
    "compliance": {
        "en": {
            "title": "Compliance",
            "body": "SHAXMAT+ follows applicable laws for online gaming and data protection.\n\nContact legal@example.com for compliance questions.",
        },
        "uz": {
            "title": "Moslik",
            "body": "SHAXMAT+ qonuniy talablarga rioya qiladi.\n\nHuquqiy savollar: legal@example.com.",
        },
        "ru": {
            "title": "Соответствие",
            "body": "SHAXMAT+ соблюдает требования законодательства.\n\nВопросы: legal@example.com.",
        },
    },
}


@router.get("/pages")
def list_pages():
    return {"slugs": sorted(_PAGES.keys())}


@router.get("/pages/{slug}")
def get_page(slug: str, lang: str = Query("en", description="en | uz | ru")):
    if slug not in _PAGES:
        raise HTTPException(status_code=404, detail="Unknown page")
    l = lang if lang in ("en", "uz", "ru") else "en"
    data = _PAGES[slug][l]
    return {"slug": slug, "lang": l, "title": data["title"], "body": data["body"]}


# External links (stores + social) — frontend can override via env in future
_DEFAULT_LINKS = {
    "app_store": "https://apps.apple.com/",
    "google_play": "https://play.google.com/store",
    "tiktok": "https://www.tiktok.com/",
    "x": "https://x.com/",
    "youtube": "https://www.youtube.com/",
    "twitch": "https://www.twitch.tv/",
    "instagram": "https://www.instagram.com/",
    "discord": "https://discord.com/",
}


@router.get("/site-links")
def site_links():
    return {"links": _DEFAULT_LINKS}
