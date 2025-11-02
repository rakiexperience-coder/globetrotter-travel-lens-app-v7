/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });


const INFLUENCER_AESTHETICS: { [key: string]: string } = {
    'general': "Ensure the final image is a clear, authentic-looking photograph.",
    'ugc_traveller': "The image should have a User-Generated Content (UGC) feel. It should look authentic, relatable, and as if it were shot on a high-end smartphone. Avoid overly polished or professional lighting. The setting should be a realistic, everyday environment.",
    'lifestyle_traveller': "The image should capture an aspirational yet relatable moment. Think cozy cafes, well-decorated home interiors, or scenic, everyday locations. The lighting should be natural and warm. The overall vibe is curated, authentic, and inviting.",
    'beauty_globetrotter': "The aesthetic should be clean, bright, and focused on the subject's face and skin. Use soft, flattering light that minimizes harsh shadows. The background should be simple and uncluttered, often a solid color or a clean bathroom/vanity setting. The mood is fresh and polished.",
    'fashion_traveller': "The focus must be on the outfit. The composition should highlight the clothing, textures, and silhouette. The background should be either a clean studio setting or a dynamic urban environment (street style). The aesthetic is chic, confident, and editorial.",
    'culinary_explorer': "The image should make the food look delicious and appealing. The setting is typically a restaurant or kitchen. Use natural light where possible. The focus is on the textures and colors of the food, with the subject interacting with it naturally.",
    'travel_creator': "The image must evoke a sense of wanderlust and adventure. The background should be a stunning and recognizable travel destination. The subject should be interacting with the environment, not just posing. The lighting should capture the mood of the location, whether it's bright sun or a moody, overcast day.",
    'digital_storyteller': "The setting should resemble a modern podcast or streaming studio. Include a professional microphone in the shot, soft studio lighting, and acoustic panels or a clean, minimalist background. The mood should be professional yet engaging.",
    'luxury_jet_setter': "The aesthetic is elegant, minimalist, and high-end. Use clean lines, neutral color palettes, and sophisticated settings (e.g., luxury hotels, designer stores, art galleries). The lighting should be soft and refined. The overall mood is exclusive and aspirational.",
    'tech_nomad': "Create a clean, modern aesthetic suitable for a tech reviewer. The setting should be a minimalist desk setup or studio with good lighting. The subject should be interacting with a piece of technology (e.g., phone, laptop) but the focus remains on them. The vibe is knowledgeable and trustworthy.",
    'creative_traveller': "The setting should be a bright, organized workshop or craft space. The subject should be actively engaged in a creative process (e.g., painting, woodworking, sewing). The aesthetic is hands-on, authentic, and inspiring. Use natural light to create a warm and inviting atmosphere.",
    'wellness_coach': "The image should feel energetic and motivational. The setting is a modern gym, a yoga studio, or an outdoor location suitable for a workout. The subject should be in athletic wear, possibly in a dynamic pose or using fitness equipment. The lighting should be bright and highlight muscle definition.",
    'music_nomad': "Capture a creative and expressive mood. The setting could be a recording studio with instruments, a moody stage with dramatic lighting, or an intimate space where they are writing music. The focus is on the artist's passion and connection to their craft.",
    'rapper_traveller': "The aesthetic should be bold, confident, and stylish. The setting could be a modern recording studio, a gritty urban location, or a luxury vehicle. The fashion should be high-end streetwear or designer. The mood is powerful, artistic, and unapologetic.",
    'genz_explorer': "Capture the quintessential 'TikTok lifestyle' aesthetic. The image should feel like a candid, high-energy still from a viral video. The setting should be trendy and relatable—think a cool cafe, a sun-drenched city street corner, an aesthetic bedroom with curated clutter (not a gaming setup), or an outdoor spot perfect for a viral trend. The fashion is key: emphasize current Gen Z trends like thrifted looks, baggy silhouettes, or unique accessories. The pose should be natural and in-the-moment, avoiding overly professional or staged compositions. The vibe is authentic, slightly unfiltered, and focused on romanticizing everyday life for a social media audience.",
    'business_jet_setter': "The aesthetic is professional, modern, and polished. The setting should be a clean, well-lit modern office, a co-working space, or an upscale business environment. The subject should be in sharp, professional attire. The mood is confident, successful, and approachable."
};

// A detailed dictionary of what each camera angle means, to give the AI better instructions.
const ANGLE_DESCRIPTIONS: { [key: string]: string } = {
    'Travel Diaries': "Shot from the true first-person perspective of someone being gently led forward by the subject’s hand. The viewer’s outstretched hand is visible in the frame, connecting with the subject’s hand. The subject looks back over their shoulder with a joyful or inviting expression while leading the viewer through a beautiful travel location. Maintain a sense of movement, connection, and cinematic depth.",
    'Window Seat Perspective': "from the perspective of a passenger looking out of a train window. The subject should be visible in profile, looking out at a stunning view (e.g., clouds, mountains, coastline). The focus is on the contemplative moment of travel.",
    'Resort View': "The subject is standing on a balcony of a beautiful hotel or resort, looking out at a breathtaking view (e.g., ocean, mountains, cityscape). The shot should capture a feeling of luxury and relaxation. It could be a morning coffee scene or an evening cocktail moment.",
    'Hidden Alleyway': "as a candid-style shot of the subject walking through a narrow, charming alleyway, perhaps with cobblestones or unique local architecture. They can be looking away from the camera, as if exploring. The aesthetic is romantic and full of wanderlust.",
    'Helipad Arrival': "A glamorous photo of the subject on a rooftop helipad next to a sleek private helicopter. The subject holds stylish travel luggage. The scene is set on a bright, sunny day with a modern city skyline visible in the distance. The aesthetic is luxurious, polished, and cinematic, capturing a moment of high-end travel.",
    'Hotel Arrival': "as an aspirational shot of the subject in the lobby of a boutique hotel. They could be interacting with the reception, or posing with their stylish luggage. The background should reflect a stylish boutique hotel lobby — curated art pieces, warm ambient lighting, and cozy yet refined furniture that feels globally inspired rather than traditionally opulent. The aesthetic is elegant, inviting, and high-end.",
    'Lobby Elevator Arrival': "A glamorous luxury hotel lobby elevator scene. The composition should capture the subject stepping out of, or about to enter, a grand elevator with polished gold or mirrored doors. The environment should reflect a five-star hotel lobby with marble floors, soft warm lighting, elegant florals, and refined architectural details. The subject should appear confident and poised, dressed in elevated travel attire appropriate for arrival at a premium hotel. The pose should feel natural and stylish — walking, turning slightly, or adjusting a handbag, sunglasses, or coat. No luggage cart is required, but a sleek carry-on or designer tote may appear subtly. The lighting should be warm, cinematic, and elegant, emphasizing the luxurious mood of arrival and transition within a high-end property.",
    'Cafe Moment': "The subject is sitting at a table of a boutique café, enjoying a coffee or a local specialty. The shot should capture the unique ambiance and character of the location, with the surrounding scene in the background. The vibe is relaxed and authentic.",
    'Golden Hour Landmark': "The subject is posing in front of a famous landmark (e.g., Eiffel Tower, Colosseum) during golden hour. The lighting must be warm, soft, and glowing, creating a magical and romantic atmosphere.",
    'Mountain Trek': "as a dynamic shot of the subject hiking on a scenic trail. They should be in appropriate hiking gear and look active and energetic. The background should be a beautiful natural landscape like a forest, canyon, or mountain path.",
    'Flatlay Essentials': "refined luxury travel flatlay — top-down view of passport, boarding pass, sleek gold pen, sunglasses with matching case, AirPods, and an iPhone face-up showing a travel itinerary screen. Hands enter from the bottom holding passport confidently. Add cappuccino cup at side. Background: luxury glass table with a subtle world-map pattern — elegant and soft, not bold. Include slim travel wallet. Warm neutral tones, modern minimalist luxury aesthetic, editorial soft light. No keys, no cameras, no jewelry accents. Gender-neutral luxury traveler vibe.",
    'Balcony View': "The subject is in or next to an infinity pool that overlooks a stunning view (ocean, city skyline, jungle). The shot emphasizes the seamless blend of the pool and the background. The mood is luxurious, serene, and aspirational.",
    'First Person Frame': "from a first-person perspective, focusing on the subject's hand holding an object like a coffee cup, a passport, or a flower against an interesting background. It's about a small moment in a larger story.",
    'Aerial View': "from a high aerial perspective, as if taken by a drone. The subject should be relatively small in the frame, surrounded by a stunning, expansive landscape like a beach, a mountain top, or an interesting cityscape. The shot should evoke a sense of scale, freedom, and adventure.",
    'Rooftop Skyline': "The subject is on a stylish rooftop viewpoint, overlooking a sprawling cityscape at either sunset or dusk. They could be holding a drink or simply taking in the view. The mood is sophisticated, urban, and chic.",
    'Luxury Shopping': "A candid-style shot of the subject on a high-end shopping street, holding shopping bags from luxury brands. They should look happy and chic. The background should feature elegant storefronts. The aesthetic is aspirational and fashion-forward.",
    'Elegant Dining': "The subject is seated at a beautifully set table in a fine dining restaurant. The focus is on an artfully plated dish in front of them, with the subject subtly in the frame. The lighting is intimate and elegant. The mood is sophisticated and epicurean.",
    'Luxury Drive POV': "The shot captures the subject driving a luxury car (e.g., sleek convertible, premium SUV, or executive sedan). The camera is positioned from just behind or beside the driver, showing their hands on the wheel and partial face as they look toward a scenic road ahead. The interior should feature elegant design details — polished leather, ambient lighting, and refined modern finishes that evoke understated luxury. The mood is one of power, freedom, and luxury.",
    'Culinary Session': "The subject is actively participating in a cooking class, focused on local cuisine. They could be chopping ingredients, stirring a pot, or plating a dish, with a look of concentration and enjoyment. The setting is an inviting, boutique-style kitchen with warm lighting and refined design touches that reflect a global culinary experience. The vibe is immersive, authentic, and hands-on.",
    'Spa Retreat': "The subject is in a serene and luxurious spa environment. They could be wrapped in a plush robe by a tranquil pool, or receiving a spa treatment. The atmosphere is calm, minimalist, and rejuvenating. The aesthetic is one of ultimate relaxation and self-care.",
    "Glass-Wall Bath Sanctuary": "A serene ultra-luxury spa moment inside a freestanding deep soaking tub, positioned beside a floor-to-ceiling glass wall with views of mountains, ocean, or a city skyline. Soft steam rises from the water, creating a warm glow. The composition is elegant, focusing on the subject from the shoulders up, suggesting a tasteful and submerged swimsuit. The scene is styled with marble or stone decor, candles, and plush towels. The mood is peaceful, cinematic, and embodies a quiet luxury wellness retreat.",
    'Private Jet View': "The subject is confidently ascending the steps of a private jet from the tarmac. They should be dressed stylishly, perhaps holding a piece of luxury luggage. The mood is exclusive, powerful, and glamorous, capturing the pinnacle of luxury travel.",
    'Scenic Cruise': "The subject is on a boat (e.g., a small tour boat, a sailboat, a gondola) moving through a beautiful body of water. The background should be a stunning coastline, a city's canals, or a dramatic fjord. The subject looks relaxed and is enjoying the scenery. The feeling is adventurous and picturesque.",
    'Street Food Adventure': "A close-up, vibrant shot of the subject taking their first bite of an interesting local street food. Their expression should be one of delight and discovery. The background is a bustling street food stall or market, adding to the authenticity. The vibe is candid, adventurous, and flavorful.",
    'Yacht Escape': "The subject is relaxing on the deck of a luxurious yacht. They are in stylish swimwear or resort wear, perhaps sunbathing or enjoying a drink with a stunning ocean backdrop. The aesthetic is glamorous, exclusive, and aspirational.",
    'Crystal Kayak Escape': "From a cinematic top-down drone perspective, the subject is lying down on a transparent crystal kayak floating on calm turquoise water. They are wearing stylish swimwear appropriate for the scene (male or female), relaxing gracefully with arms resting above the head or by the sides — no paddles or props in view. The subject’s face is clearly visible and well-lit, showing a calm, confident expression while maintaining natural relaxation. The kayak’s clear structure is fully visible through the water, surrounded by sunlight reflections and soft ripples. The water should be crystal-clear and tropical, emphasizing transparency and luxury. The lighting is bright and natural, creating a serene, editorial look reminiscent of Bora Bora or the Maldives. The overall mood is elegant, aspirational, and tranquil — a high-end travel aesthetic that captures effortless luxury.",
    "Airport Lounge": "The subject is seated inside a bright, luxury airport lounge during the day. Large floor-to-ceiling windows reveal airplanes parked outside on the sunny runway. The lighting is soft and natural, creating a calm, upscale travel vibe. The subject sits comfortably on a plush chair with stylish luggage beside them and a glass of champagne on the table. The mood is elegant, exclusive, and serene — capturing the luxury of a premium pre-flight moment.",
    "Airport Vanity Refresh": "A polished, luxury airport restroom vanity moment — clearly inside a premium airport lounge or terminal washroom. Subject applies lip gloss or lipstick, adjusts sunglasses or hair in the mirror. Visible restroom stalls or restroom signage behind, clean modern marble counters, warm soft lighting. Subtle airport cues: carry-on luggage nearby, travel-ready outfit, blurred traveler or staff in background optional. Scene should NOT look like a hotel bathroom. Composition should feel elegant, feminine, pre-flight self-care energy, calm confidence, and chic airport ambience.",
    "Boarding Gate Walk": "The subject is walking confidently through a bright, modern airport terminal toward the boarding gate. The scene features large glass windows with planes visible outside in clear daylight — specifically showing a British Airways style aircraft with a blue tail (no red tail planes). The subject is pulling sleek designer luggage with one hand and holding a passport and boarding pass in the other. The subject maintains direct eye contact with the camera, giving a poised, elegant, confident pre-flight look. The outfit is elevated travel fashion — stylish, trendy, and upscale, featuring luxe casual pieces such as a chic knit top, relaxed tailored trousers, designer tote, soft neutral tones, and subtle gold accessories, avoiding corporate or business attire. Lighting should be soft, clean, and natural, highlighting the spacious architecture, glossy floors, and premium airport feel. The mood is calm, intentional, and stylish — capturing the excitement and sophistication of boarding a long-haul first-class flight.",
    "Jetbridge Boarding Walk": "A cinematic back-view moment of the subject walking through the jetbridge toward the aircraft. Scene captures the iconic enclosed jetbridge tunnel with floor-to-ceiling windows or soft side-panel lighting leading directly to the plane. A British Airways-style aircraft with a blue tail (no red tail planes) is subtly visible outside to the left or right, grounded at the boarding gate. Exterior airplanes must be clearly visible outside the glass jetbridge windows — unmistakably establishing the airport boarding zone. The subject wheels luxe carry-on luggage with smooth, composed movement, hair flowing naturally, posture straight and poised. Wardrobe matches elevated airport travel style — refined neutrals, relaxed tailoring, polished knit, chic carry-on tote, subtle gold accessories, and stylish sunglasses resting on head or collar. Lighting is clean, warm daylight with soft highlights, showing modern airport textures, metal framing, glass reflections, and runway atmosphere. Mood: calm, anticipatory, aspirational — capturing the intimate moment just before stepping onto a first-class long-haul flight, blending elegance, excitement, and quiet luxury.",
    "First Class Cabin": "The subject is seated comfortably in a luxurious first-class airplane suite. The scene features plush wide seating, soft ambient lighting, elegant neutral tones, and a spacious cabin feel with high-end finishes. The subject is relaxed and composed, sipping champagne or enjoying a welcome beverage on a refined tray table. A large airplane window shows a soft daylight sky or runway view outside. The outfit is polished and elegant — refined travel style suitable for premium international travel. The camera angle feels cinematic and aspirational, highlighting comfort, exclusivity, and quiet luxury in flight.",
    "Hotel Arrival Buggy Ride": "The subject is being chauffeured toward the grand entrance of a luxury hotel, viewed from behind the buggy with the entire vehicle visible in frame. The camera captures a full-frontal view of the hotel architecture ahead — tall palm trees, wide driveway, and a symmetrical arrival path leading directly to the lobby doors. The buggy is centered in the shot, driven by a uniformed hotel staff member, with the passenger seated at the rear right seat, relaxed and looking toward the camera or slightly to the side. Designer luggage is neatly positioned at the back of the buggy. The composition should preserve a wide, cinematic angle that includes the full buggy, palm-lined path, and the hotel in the distance. Lighting should be bright, polished, and natural, conveying tropical warmth and luxury. The mood is sophisticated, calm, and welcoming — evoking the perfect luxury arrival moment.",
    "Suite Entry": "The scene captures the cinematic moment of entering a luxury suite. The subject is viewed from slightly behind as they hold and tap a key card on the door, opening into a spacious, beautifully styled hotel suite. A soft wash of natural daylight spills from the interior, illuminating high-end finishes, elegant décor, and a welcoming ambience. Designer luggage is positioned near the entrance or slightly behind the subject. The camera perspective emphasizes anticipation, luxury, and the emotional reveal of a premium stay — focusing on the key card moment, the opening door, and the first glimpse into the upscale suite setting.",
    "Suite Exploration": "A cinematic walk-through of a luxury suite, capturing the excitement of arrival and discovery. Subject is dressed in elegant travel attire (chic travel co-ord, fitted blazer, or stylish lounge-casual look — no pajamas), moving gracefully through the space while exploring premium features such as plush bedding, modern furniture, soft ambient lighting, and curated decor. Subject may run a hand across luxe textures, adjust curtains toward a panoramic window, or admire the view. A standard sleek suitcase may be open or positioned near the seating area as part of the arrival journey. Style is refined and aspirational — warm light, depth, immersive composition, conveying quiet luxury and first-moment excitement inside a private suite.",
    "Suite Wardrobe Glam Prep": "A refined hotel-suite wardrobe moment where the guest begins unpacking in a luxury suite. Built-in hotel wardrobe or open closet niche with luggage bench and hotel robe + hotel slippers visible. Open suitcase neatly styled on luggage stand or bench. Designer heels, sunglasses, and perfume arranged effortlessly on a small hotel side table. Soft golden suite lighting, sheer curtains with city or resort view, premium carpet or wood floor, plush bedding or minibar shelf visible in background — unmistakably a hotel suite. Subject in hotel robe or elegant resort loungewear, selecting an outfit. Mood: elevated, feminine, polished, high-end travel ritual.",
    "Flower Pool Breakfast": "A luxurious tropical flower-petal pool breakfast in a high-end villa. The scene features a stunning pool with intricate floating flower petal arrangements. The subject is waist-deep in the water, interacting with a floating breakfast tray. The subject wears an elegant one-piece or bikini swimsuit, suitable for a refined resort setting. The pose is relaxed and aspirational, conveying luxury wellness. The background includes lush greenery or elegant villa architecture. Lighting is soft and natural. The mood is calm, indulgent, and focused on a high-end resort experience.",
    "Poolside Cabana Lifestyle": "A glamorous resort pool cabana scene in a five-star hotel environment. The full cabana frame should be visible, including canopy and curtains, with the subject relaxing in an elegant, confident pose. The background must clearly show a main resort pool with sparkling water, palm trees, and other cabanas or loungers visible in the distance, along with a few softly blurred guests to convey a lively yet refined atmosphere. Attire should be chic resortwear appropriate for a poolside setting, and the subject should be barefoot or in minimal flat resort sandals (no heels or dress shoes). Props such as a fruit tray, iced drink, sun hat, or towels may appear. Lighting is warm, bright, and elegant, expressing modern luxury and aspirational vacation energy at a major resort pool.",
    "Post-Swim Glow": "A refined, luxury-resort pool moment capturing the subject rising gracefully from the water after a refreshing swim. The subject is waist-deep or emerging from the pool edge, with sun-kissed, glistening skin and a soft, editorial glow. Pose mirrors elegant wellness-focused resort imagery — calm expression, relaxed posture, and eye gaze slightly upward or toward the light, evoking confidence and serenity. The swimsuit remains chic and tasteful, either a sleek bikini or refined one-piece in neutral or metallic tones. Background includes upscale poolside loungers and tropical palms or modern villa architecture. Lighting is bright, golden, and natural, with soft highlights on water droplets for a radiant effect. Mood is aspirational, rejuvenating, and luxurious — showcasing elevated travel leisure and effortless resort elegance."
};


// --- Helper Functions ---

/**
 * Processes the Gemini API response, extracting the image or throwing an error if none is found.
 * @param response The response from the generateContent call.
 * @returns A data URL string for the generated image.
 */
function processGeminiResponse(response: GenerateContentResponse): string {
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const textResponse = response.text;
    console.error("API did not return an image. Response:", textResponse);
    throw new Error(`The AI model responded with text instead of an image: "${textResponse || 'No text response received.'}"`);
}

/**
 * A wrapper for the Gemini API call that includes a retry mechanism for timeout or network errors.
 * @param imagePart The image part of the request payload.
 * @param textPart The text part of the request payload.
 * @returns The GenerateContentResponse from the API.
 */
async function callGeminiWithRetry(imagePart: object, textPart: object): Promise<GenerateContentResponse> {
    const modelParams = {
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    };

    try {
        return await ai.models.generateContent(modelParams);
    } catch (error) {
        console.log("Retrying due to Gemini timeout or network error...");
        await new Promise(r => setTimeout(r, 1000));
        return await ai.models.generateContent(modelParams);
    }
}


/**
 * Generates a styled image from a source image and a camera angle prompt.
 * It includes a fallback mechanism for prompts that might be blocked.
 * @param imageDataUrl A data URL string of the source image (e.g., 'data:image/png;base64,...').
 * @param angle The camera angle to apply (e.g., 'Low angle shot').
 * @param options An optional object that can contain a 'regenerate' flag and an 'influencerType'.
 * @returns A promise that resolves to a base64-encoded image data URL of the generated image.
 */
export async function generateAngleImage(
    imageDataUrl: string,
    angle: string,
    options: { regenerate?: boolean; influencerType?: string; gender?: string; location?: string } = {}
): Promise<string> {
  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
  }
  const [, mimeType, base64Data] = match;

    const imagePart = {
        inlineData: { mimeType, data: base64Data },
    };
    
    const { regenerate = false, influencerType = 'general', gender = 'female', location = '' } = options;
    const aestheticInstruction = INFLUENCER_AESTHETICS[influencerType] || INFLUENCER_AESTHETICS['general'];
    
    let angleDescription = ANGLE_DESCRIPTIONS[angle] || `from a perspective known as a "${angle}".`;
    if (angle === 'GRWM (Get Ready With Me)' && gender === 'male') {
        angleDescription = "from a perspective of a man in a bathroom, looking into a mirror. The shot should be medium-close, capturing a masculine grooming routine like styling hair, trimming a beard, or applying skincare. Avoid showing makeup application. The setting should be clean and modern. The vibe is informal and focused on self-care.";
    }
    
    const primaryPrompt = `Instruction: Create a photorealistic 16:9 PNG image.
Your task is to take the person from the source image and integrate them seamlessly into a new, fully-realized scene based on the details below. This is a creative transformation, not a simple background replacement.

**Scene Brief:**
*   **Concept:** A shot in the style of "${angle}".
*   **Setting:** ${location ? `The scene is in ${location}.` : 'Create a setting that fits the concept.'} The environment must be detailed and believable.
*   **Gender:** Portray the subject as ${gender}.
*   **Detailed Description:** ${angleDescription}
*   **Art Direction:** The final image must have this aesthetic: ${aestheticInstruction}.
*   **Posing:** ${regenerate ? 'Create a new pose, different from the source image.' : 'The pose should be natural for the scene.'}

**Crucial:** The final output MUST be an image. Do not return text.`;
    
    const fallbackPrompt = `Instruction: Create a photorealistic 16:9 PNG image.
Task: Place the person from the source image into a new scene.
- Shot: "${angle}"
- Location: ${location || 'A fitting location for the shot.'}
- Details: ${angleDescription}
- Style: ${aestheticInstruction}
- Gender: ${gender}
- IMPORTANT: The output must be an image.`;

    // --- First attempt with the original prompt ---
    try {
        console.log(`Attempting generation for "${angle}" with original prompt...`);
        const textPart = { text: primaryPrompt };
        const response = await callGeminiWithRetry(imagePart, textPart);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        const isNoImageError = errorMessage.includes("The AI model responded with text instead of an image");

        if (isNoImageError) {
            console.warn(`Original prompt for "${angle}" was likely blocked. Trying a fallback prompt.`);
            
            // --- Second attempt with the fallback prompt ---
            try {
                console.log(`Attempting generation for "${angle}" with fallback prompt...`);
                const fallbackTextPart = { text: fallbackPrompt };
                const fallbackResponse = await callGeminiWithRetry(imagePart, fallbackTextPart);
                return processGeminiResponse(fallbackResponse);
            } catch (fallbackError) {
                console.error("Fallback prompt also failed.", fallbackError);
                const finalErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
                throw new Error(`The AI model failed with both original and fallback prompts. Last error: ${finalErrorMessage}`);
            }
        } else {
            // This is for other errors, like a final internal server error after retries.
            console.error(`An unrecoverable error occurred during image generation for "${angle}".`, error);
            throw new Error(`The AI model failed to generate an image. Details: ${errorMessage}`);
        }
    }
}

/**
 * Generates a travel itinerary using Gemini by requesting one day at a time to ensure completeness.
 * @param destination The travel destination.
 * @param duration The length of the trip (e.g., "5 days").
 * @param travelStyle The user's preferred travel style (e.g., "adventurous", "relaxing").
 * @returns A promise that resolves to a string containing the complete, markdown-formatted itinerary.
 */
export async function generateItinerary(
    destination: string,
    duration: string,
    travelStyle: string
): Promise<string> {
    const style = travelStyle || "balanced";

    // 1. Parse number of days from duration string like "5 days"
    const durationMatch = duration.match(/\d+/);
    const numDays = durationMatch ? parseInt(durationMatch[0], 10) : 1;
    
    // Use the parsed number for the title, e.g., "5 Day" or "1 Day"
    const finalDurationText = `${numDays} Day${numDays > 1 ? 's' : ''}`;

    const itineraryParts: string[] = [];
    
    // 2. Loop through each day and generate a plan
    for (let day = 1; day <= numDays; day++) {
        const dayPrompt = `You are an expert travel planner creating a luxury-style travel itinerary.
This is Day ${day} of a ${numDays}-day trip to ${destination}. The travel style is "${style}".
Generate ONLY the plan for Day ${day}.

Use this exact format and nothing else:
<b>Day ${day}: [Creative Day Title]</b><br><br>
<b>Morning:</b> Description of morning activities with <b>bold highlights</b>.<br><br>
<b>Afternoon:</b> Description of afternoon activities with <b>bold highlights</b>.<br><br>
<b>Evening:</b> Description of evening activities with <b>bold highlights</b>.<br><br>
💡 <b>Tip:</b> A short, helpful tip related to the day's activities.<br><br>

Your output must be clean, well-structured HTML using only <b> and <br> tags.
The tone should be elegant and cinematic.
Do not add any introductory or concluding text, titles, or summaries. Generate ONLY the content for Day ${day}.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: dayPrompt,
            });
            itineraryParts.push(response.text);
        } catch (error) {
            console.error(`Error generating itinerary for Day ${day}:`, error);
            itineraryParts.push(`<b>Day ${day}: Generation Error</b><br><br>An error occurred while planning this day. Please try regenerating the itinerary.<br><br>`);
        }
    }

    // 3. Assemble the full itinerary
    const planAndBookSection = `---
<b>✨ Plan & Book Your Trip ✨</b><br><br>
Looking to turn your AI-crafted itinerary into reality? Here are trusted booking options curated by <b>RAKI AI Digital DEN</b>:<br><br>
🏨 <b>Hotels:</b><br>
Option 1 — <a href="https://www.awin1.com/cread.php?awinmid=105925&awinaffid=1865944&ued=https%3A%2F%2Fwww.trivago.co.uk%2F" target="_blank">Book with Trivago UK</a><br>
Option 2 — <a href="https://www.awin1.com/cread.php?awinmid=4329&awinaffid=1865944&ued=https%3A%2F%2Fwww.lastminute.com%2F" target="_blank">Book with Lastminute.com</a><br><br>
🛫 <b>Flights, Hotels & Cars:</b><br>
<a href="https://trip.tpo.lv/Yjlwv6FB" target="_blank">Trip.com</a><br><br>
🎟️ <b>Tours & Attractions:</b><br>
<a href="https://tiqets.tpo.lv/1CSNZ3w6" target="_blank">Tiqets</a><br><br>
📶 <b>eSIM & Data:</b><br>
<a href="https://airalo.tpo.lv/UXIgYnfO" target="_blank">Airalo</a><br><br>
---`;

    const title = `<b>${destination} – ${finalDurationText} Smart Itinerary</b><br><br>`;
    const body = itineraryParts.join('');

    return `${title}${body}${planAndBookSection}`;
}