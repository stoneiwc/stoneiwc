"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const CONCERNS: Record<string, { title: string; content: string }[]> = {
  "Muscle, Joint & Skeletal Health": [
    {
      title: "Muscle Tension",
      content:
        "Muscle tension refers to the condition in which muscles of the body remain semi-contracted for an extended period. Muscle tension is typically caused by the physiological effects of stress, bad posture, and/or repetitive motion.",
    },
    {
      title: "Muscle Pain",
      content:
        "Painful muscle cramps or muscle spasms? StoneIWC has a variety of treatments that help relax the body, provide pain relief, and reduce muscle spasms.",
    },
    {
      title: "Skeletal Pain",
      content:
        "Aches and pains in the bones? Feeling stiffness or reduced flexibility in the joints? StoneIWC is able to reduce pain and help promote good bone structure and strength. We have a variety of treatments that help relax the body and reduce stiffness in the joints.",
    },
    {
      title: "Temporomandibular Joint Dysfunction (TMJ)",
      content:
        "Temporomandibular Joint Dysfunction can cause pain and stiffness in the affected joints. StoneIWC has treatments that can help relax the joints and reduce joint pain.",
    },
    {
      title: "Acute or Chronic Pain",
      content:
        "Pain can be caused by a number of things and taking large amounts of medicine for pain relief may not be beneficial, but harmful in the long run. Here at StoneIWC we treat not only pain relief, but also the root cause to stop and prevent future pain.",
    },
    {
      title: "Calcium Deposit",
      content:
        "Having calcium buildup in the toes can be very painful and it is important to treat it as soon as possible. StoneIWC has treatments for both the hand and feet for calcium deposit.",
    },
    {
      title: "Hammer Toe",
      content:
        "Hammer toe is an abnormality in the joint of the toe. It can cause pain and discomfort due to the shape of the abnormality. Here at StoneIWC, we have a variety of services that help treat hammer toe.",
    },
  ],
  "Circulation, Detox & Immunity": [
    {
      title: "Circulation",
      content:
        "Circulation of bodily fluids, the body circulates fluid to transport nutrients as well as toxins in and out of the body. When the body's fluid circulates correctly, everything is good. But when the body's fluid circulation slows and becomes stagnant, nutrients and oxygen do not reach the cells sufficiently. Excess fluid that contains the cells' waste by-products, dead cells, malignant cells, harmful bacteria, and viruses cannot be expelled.",
    },
    {
      title: "Chronic Venous Insufficiency (CVI)",
      content:
        "Chronic Venous Insufficiency, or CVI, causes blood clots, poor circulation, or high blood pressure. Here at StoneIWC, we have a variety of treatments dedicated to treating CVI.",
    },
    {
      title: "Cardiovascular System",
      content:
        "Palpitations of the heart or problems with blood pressure? Worrying about potential heart problems? StoneIWC has treatments that help relax the body and promote good circulation and cleanse the body of toxins to help prevent future heart problems and help strengthen the heart.",
    },
    {
      title: "Toxin Removal",
      content:
        "Toxins are found in everything that is manufactured — medicine, food, water, and even the air we breathe. We are surrounded by synthetic chemicals that can build up and become harmful. When our bodies are healthy and functioning properly, we can effectively deal with a fair amount of daily toxicity. However, when a toxic overload occurs problems start to occur, including fatigue, weakness, depression, or pain.",
    },
    {
      title: "Weakened Immune System",
      content:
        "A weakened immune system can cause a number of problems such as higher sensitivity or susceptibility to viruses and illnesses, slower recovery rates, or heightened stress levels.",
    },
    {
      title: "Enhanced Allergies",
      content:
        "Enhanced allergies may be caused by imbalances in the body and can range from mild to severe. StoneIWC has treatments that promote circulation and help reduce allergic symptoms and possibly stop allergic reactions entirely.",
    },
  ],
  "Skin, Hair & Nails": [
    {
      title: "Skin Conditions",
      content:
        "Scar tissue from past surgeries, moles, warts, spider veins, and other skin imperfections can be treated with our specialty modalities and skincare products for beautiful and flawless skin. Acne and breakouts could be caused by one's environment and dietary habits. StoneIWC has a number of different acne treatments, and we work with our clients to create a meal plan that supports their health and wellness.",
    },
    {
      title: "Hair Loss / Hair Growth",
      content:
        "Male pattern baldness, or general baldness, is common among most men, some being affected as early as their teenage years. Women can also suffer from hair loss because of genetic dispositions, diseases, and ailments, or even as a side effect of treatments such as chemotherapy. Hair loss can also be affected by diet, stress levels, and environmental damage. StoneIWC addresses the underlying issues to help improve hair health.",
    },
    {
      title: "Fungus",
      content:
        "Fungus on the body can be caused by bacteria, infections, or uncleanliness. Having fungus could cause pain, inflammation, or poor circulation in the affected area, and promote illnesses from bacteria buildup. StoneIWC has treatments that can help clean the fungus and prevent future recurrence.",
    },
    {
      title: "Ingrown Nails",
      content:
        "Having ingrown nails is very common, most often in the toes, but can also appear in the fingernails. Treating ingrown nails is very important for pain relief, swelling, and poor circulation. StoneIWC has many treatments to help and prevent ingrown nails.",
    },
  ],
  "Mental & Emotional Health": [
    {
      title: "Mood Swings",
      content:
        "Mood swings may be caused by hormonal issues or a toxic buildup. StoneIWC has treatments that can help promote good circulation and flush out toxins to reduce mood swings.",
    },
    {
      title: "Acute or Chronic Depression",
      content:
        "Depression can be caused by a number of factors such as hormonal imbalance or an influx of toxicity in the body. StoneIWC has many treatments that can help promote good circulation and flush out the toxicity to reduce depressive moods and relax the body.",
    },
    {
      title: "Fatigue or Weakness",
      content:
        "Feeling overly tired even with the appropriate amount of sleep? Weakness in the bones or muscles without recent injury or surgery? Sudden or chronic fatigue can be caused by a number of factors. StoneIWC has a variety of treatments that can strengthen your body and give you immediate energy to reduce fatigue and weakness.",
    },
    {
      title: "Tourette's Syndrome",
      content:
        "StoneIWC treats a variety of concerns. Our treatments help relax the body and cleanse the body of toxins that may cause muscle spasms. Contact us for more information.",
    },
  ],
  "Weight & Internal Health": [
    {
      title: "Weight Loss",
      content:
        "Weight loss is something that many desire, but struggle to accomplish. StoneIWC has many treatments that can help with weight loss. Schedule an appointment with us to find a treatment that works for you and your body.",
    },
    {
      title: "Gastrointestinal Problems",
      content:
        "Stomach or digestive problems could be caused by an imbalance of nutrients or the buildup of toxins. Eating certain foods over others may help in preventing gastrointestinal problems. StoneIWC works to flush out toxins and create nutritional meal plans for each client to prevent digestive problems and strengthen the digestive system.",
    },
    {
      title: "Reproductive Problems",
      content:
        "Possible miscarriages, lack of conceiving, and other reproductive problems may be caused by a buildup of toxins related to stress and anxiety. Inflammation of the reproductive organs can also affect reproductive success. StoneIWC works to flush out and cleanse the body, strengthening the immune system, and promoting natural healing.",
    },
  ],
  "Heart & Lung Health": [
    {
      title: "Respiratory System",
      content:
        "Shortness of breath or difficulties breathing? Problems in the lungs? StoneIWC is able to relax the body and help reduce difficulties in breathing and cleanse the body of toxins that may be blocking the lungs from properly working.",
    },
    {
      title: "Cardiovascular System",
      content:
        "Palpitations of the heart or problems with blood pressure? Worrying about potential heart problems? StoneIWC has treatments that help relax the body and promote good circulation and cleanse the body of toxins to help prevent future heart problems and help strengthen the heart.",
    },
  ],
}

const CATEGORIES = Object.keys(CONCERNS)

export function ConcernsExplorer() {
  const [active, setActive] = useState(CATEGORIES[0])
  const items = CONCERNS[active]

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

          {/* Category list */}
          <aside className="lg:w-72 lg:shrink-0">
            <p className="mb-5 font-body text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Categories
            </p>
            <ul className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
              {CATEGORIES.map((cat, i) => (
                <li key={cat}>
                  <button
                    onClick={() => setActive(cat)}
                    className={cn(
                      "w-full rounded-sm px-4 py-3 text-left font-body text-sm transition-all",
                      active === cat
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground hover:bg-primary/8 hover:text-primary"
                    )}
                  >
                    <span className="mr-2 font-sans text-xs text-primary/40 font-semibold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <div className="mb-8 border-b border-border pb-6">
              <h2 className="font-sans text-2xl font-semibold tracking-wide text-foreground md:text-3xl">
                {active}
              </h2>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                {items.length} concern{items.length !== 1 ? "s" : ""} in this category
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-sm border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <h3 className="font-sans text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
