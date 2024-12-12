```bash
deno task test                                                                         ─╯
Task test deno test --allow-net --allow-read --allow-env
Unsupported compiler options in "file:///Users/cmcewing/Documents/mission_ready/level-05/mission-05/research/deno-2-hono-react-nextjs/backend/deno.json".
  The following options were ignored:
    allowJs
running 14 tests from ./tests/chat.test.ts
Chat API - /v1/start - should accept empty message ... ok (4ms)
Chat API - /v1/continue - should require history and message ... ok (0ms)
Chat API - Positive opt-in should continue conversation ...
------- output -------
Checking opt-in for response: Yes, I would like help choosing insurance
Opt-in result: true
----- output end -----
Chat API - Positive opt-in should continue conversation ... ok (7s)
Chat API - Negative opt-in should end conversation ...
------- output -------
Checking opt-in for response: No thanks, not interested right now
Opt-in result: false
----- output end -----
Chat API - Negative opt-in should end conversation ... ok (7s)
Chat API - Ambiguous response should be interpreted by Gemini ...
------- output -------
Checking opt-in for response: I might be interested
Opt-in result: false
----- output end -----
Chat API - Ambiguous response should be interpreted by Gemini ... ok (7s)
Chat API - Should handle positive-leaning ambiguous responses ...
------- output -------
Checking opt-in for response: I guess that would be helpful
Opt-in result: true
----- output end -----
Chat API - Should handle positive-leaning ambiguous responses ... ok (7s)
Chat API - Should handle negative-leaning ambiguous responses ...
------- output -------
Checking opt-in for response: Not really sure about this
Opt-in result: false
----- output end -----
Chat API - Should handle negative-leaning ambiguous responses ... ok (7s)
Chat API - Should continue conversation after opt-in ...
------- output -------
Checking opt-in for response: Yes, please help me
Opt-in result: true
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [ "3RDP" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_YES"
}
----- output end -----
Chat API - Should continue conversation after opt-in ... ok (15s)
Integration - Truck Scenario [3RDP] ...
------- output -------
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "UNKNOWN"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [ "3RDP" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_YES"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [ "3RDP" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_YES"
}
----- output end -----
Integration - Truck Scenario [3RDP] ... ok (23s)
Integration - Racing Car Scenario [3RDP] ...
------- output -------
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "UNKNOWN"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: true,
  policyRecommendations: [ "3RDP" ],
  racingCarStatus: "CONFIRMED_YES",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: true,
  policyRecommendations: [ "3RDP" ],
  racingCarStatus: "CONFIRMED_YES",
  truckStatus: "CONFIRMED_NO"
}
----- output end -----
Integration - Racing Car Scenario [3RDP] ... ok (30s)
Integration - Regular Car Over 10 Years [MBI, 3RDP] ...
------- output -------
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "UNKNOWN"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "CONFIRMED_OLD",
  hasEnoughInfo: true,
  policyRecommendations: [ "MBI", "3RDP" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "CONFIRMED_OLD",
  hasEnoughInfo: true,
  policyRecommendations: [ "MBI", "3RDP" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
----- output end -----
Integration - Regular Car Over 10 Years [MBI, 3RDP] ... ok (38s)
Integration - Regular Car Under 10 Years [MBI, CCI] ...
------- output -------
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "UNKNOWN"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "CONFIRMED_NEW",
  hasEnoughInfo: true,
  policyRecommendations: [ "MBI", "CCI" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "CONFIRMED_NEW",
  hasEnoughInfo: true,
  policyRecommendations: [ "MBI", "CCI" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
----- output end -----
Integration - Regular Car Under 10 Years [MBI, CCI] ... ok (39s)
Integration - Brand New Car [MBI, CCI] ...
------- output -------
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "UNKNOWN"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "CONFIRMED_NEW",
  hasEnoughInfo: true,
  policyRecommendations: [ "MBI", "CCI" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "CONFIRMED_NEW",
  hasEnoughInfo: true,
  policyRecommendations: [ "MBI", "CCI" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
----- output end -----
Integration - Brand New Car [MBI, CCI] ... ok (39s)
Integration - Recommendation Message Format ...
------- output -------
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "UNKNOWN"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "UNKNOWN",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "UNKNOWN",
  hasEnoughInfo: false,
  policyRecommendations: [],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "CONFIRMED_NEW",
  hasEnoughInfo: true,
  policyRecommendations: [ "MBI", "CCI" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
Analysis result: {
  carAgeStatus: "CONFIRMED_NEW",
  hasEnoughInfo: true,
  policyRecommendations: [ "MBI", "CCI" ],
  racingCarStatus: "CONFIRMED_NO",
  truckStatus: "CONFIRMED_NO"
}
----- output end -----
Integration - Recommendation Message Format ... ok (40s)

ok | 14 passed | 0 failed (4m26s)

```