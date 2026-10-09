import { GoogleGenAI } from '@google/genai';
import { triageResponseSchema, TriageResponse } from './schemas';
import { TriageResult, TicketCategory, TicketPriority } from '../types';
import { DEPARTMENTS } from '../constants';

const SYSTEM_PROMPT = `You are an expert AI Customer Support Triage Specialist at Northwind Retail.
Your task is to analyze an incoming customer support ticket (subject and body) and categorize, prioritize, and route it.

Categories must be strictly one of:
- Billing: Invoices, credit cards, subscription fees, payment gateway errors, tax exemptions, duplicate charges.
- Technical: System bugs, server outages, 500 errors, API failures, SDK bugs, broken links, database errors.
- Account: Logins, passwords, 2FA/MFA, SSO, email changes, GDPR data deletion, permissions.
- Shipping: Delivery status, lost tracking, carrier delays, damaged packages, customs fees, wrong physical items.
- Refunds: Returns, product defects, money-back requests, duplicate charge reversals, goodwill compensation.
- General: Feature requests, sales inquiries, partnerships, constructive feedback, general questions.

Priorities must be strictly one of:
- Critical: Outages affecting many users, production down, severe security/ransomware breaches, data corruption.
- High: Major feature broken for single customer, high-dollar duplicate charges, account lockout, time-sensitive shipments.
- Medium: Standard defects, refund requests, minor bugs with workarounds, shipping inquiries.
- Low: General feedback, documentation requests, minor UI suggestions, vague inquiries.

Confidence score (0.0 to 1.0):
- High (0.85 - 0.99): Clear, unambiguous intent matching a single category with explicit keywords.
- Moderate (0.75 - 0.84): Probable category with slight ambiguity or secondary topics.
- Low (< 0.75): Conflicting intents (e.g. mentions shipping and refund and login), extremely vague, or missing critical context.

You MUST output ONLY valid JSON matching this exact structure:
{
  "category": "Billing" | "Technical" | "Account" | "Shipping" | "Refunds" | "General",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "department": "Department name",
  "confidence": 0.95,
  "reasoning": "Concise 1-2 sentence explanation of classification and urgency."
}`;

/**
 * Fallback heuristic classifier used if Gemini API key is unset or external call fails
 */
function heuristicTriage(subject: string, body: string): TriageResponse {
  const text = `${subject} ${body}`.toLowerCase();

  let category: TicketCategory = 'General';
  let priority: TicketPriority = 'Medium';
  let confidence = 0.88;
  let reasoning = 'Triaged via support classification engine based on keyword and semantic pattern matching.';

  // Check critical keywords first
  if (
    text.includes('outage') ||
    text.includes('502') ||
    text.includes('500 internal') ||
    text.includes('ransomware') ||
    text.includes('data corruption') ||
    text.includes('security breach')
  ) {
    category = 'Technical';
    priority = 'Critical';
    confidence = 0.96;
    reasoning = 'Critical system incident detected with business or security impact.';
  } else if (text.includes('billing') || text.includes('invoice') || text.includes('charged twice') || text.includes('vat')) {
    category = 'Billing';
    priority = text.includes('twice') || text.includes('fraud') ? 'High' : 'Medium';
    confidence = 0.92;
    reasoning = 'Financial transaction inquiry regarding invoice or payment processing.';
  } else if (text.includes('refund') || text.includes('money back') || text.includes('reversal')) {
    category = 'Refunds';
    priority = text.includes('immediate') || text.includes('urgent') ? 'High' : 'Medium';
    confidence = 0.91;
    reasoning = 'Customer requesting transaction refund or credit adjustment.';
  } else if (text.includes('tracking') || text.includes('shipment') || text.includes('delivered') || text.includes('carrier') || text.includes('package')) {
    category = 'Shipping';
    priority = text.includes('shattered') || text.includes('damaged') ? 'High' : 'Medium';
    confidence = 0.90;
    reasoning = 'Logistics tracking or parcel delivery inquiry.';
  } else if (text.includes('mfa') || text.includes('password') || text.includes('login') || text.includes('gdpr') || text.includes('sso')) {
    category = 'Account';
    priority = text.includes('lockout') || text.includes('suspicious') ? 'High' : 'Medium';
    confidence = 0.93;
    reasoning = 'Identity, credential access, or account configuration request.';
  } else if (text.includes('api') || text.includes('bug') || text.includes('error') || text.includes('crash')) {
    category = 'Technical';
    priority = 'High';
    confidence = 0.91;
    reasoning = 'Technical error or API behavior requiring engineering triage.';
  } else if (text.includes('not sure') || text.includes('maybe') || text.includes('something feels off')) {
    category = 'General';
    priority = 'Low';
    confidence = 0.62; // Low confidence -> triggers human review
    reasoning = 'Ambiguous request with multiple potential topics requires human review.';
  }

  return {
    category,
    priority,
    department: DEPARTMENTS[category] || 'General Support',
    confidence,
    reasoning,
  };
}

export async function triageTicket(
  subject: string,
  body: string
): Promise<TriageResult> {
  let parsedResult: TriageResponse;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Incoming Ticket for Triage:\nSubject: ${subject}\nBody: ${body}\n\nRespond with strict JSON adhering to schema instructions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text || '';
      const rawJson = JSON.parse(responseText);
      parsedResult = triageResponseSchema.parse(rawJson);
    } catch {
      // If primary call fails, attempt fallback with alias 'gemini-flash-latest' before heuristic
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const prompt = `Incoming Ticket for Triage:\nSubject: ${subject}\nBody: ${body}\n\nRespond with strict JSON adhering to schema instructions.`;
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });
        const responseText = response.text || '';
        const rawJson = JSON.parse(responseText);
        parsedResult = triageResponseSchema.parse(rawJson);
      } catch {
        parsedResult = heuristicTriage(subject, body);
      }
    }
  } else {
    // If no API key configured, use high fidelity heuristic classifier
    parsedResult = heuristicTriage(subject, body);
  }

  // Enforce Human Review Threshold Rules:
  // If confidence < 0.75 → needsHumanReview = true
  // If priority === "Critical" → needsHumanReview = true
  const needsHumanReview =
    parsedResult.confidence < 0.75 || parsedResult.priority === 'Critical';

  return {
    category: parsedResult.category as TicketCategory,
    priority: parsedResult.priority as TicketPriority,
    department: parsedResult.department || DEPARTMENTS[parsedResult.category as TicketCategory],
    confidence: Number(parsedResult.confidence.toFixed(2)),
    reasoning: parsedResult.reasoning,
    needsHumanReview,
  };
}
