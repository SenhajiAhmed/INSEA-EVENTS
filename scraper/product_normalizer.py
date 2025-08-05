import json
from typing import List, Dict, Any


class ProductNormalizer:
    MANDATORY_KEYS = [
        "name",
        "address",
        "authority",
        "phone",
        "rating",
        "number_of_rates",
        "details",
    ]

    def __init__(self, input_path: str, output_path: str = None):
        self.input_path = input_path
        self.output_path = output_path

    @staticmethod
    def is_numeric_string(value: Any) -> bool:
        if not isinstance(value, str):
            return False
        value = value.strip()
        try:
            float(value.replace(",", "."))
            return True
        except ValueError:
            return False

    def normalize_product(self, product: Dict[str, Any]) -> Dict[str, Any]:
        normalized = dict(product)  # copie

        # Ajouter clés manquantes sauf 'url' (pas obligatoire)
        for key in self.MANDATORY_KEYS:
            if key not in normalized:
                normalized[key] = ""

        rating = normalized.get("rating", "")
        number_of_rates = normalized.get("number_of_rates", "")

        # rating doit être un nombre sinon fallback sur number_of_rates
        if not self.is_numeric_string(rating):
            if self.is_numeric_string(number_of_rates):
                normalized["rating"] = number_of_rates
                normalized["number_of_rates"] = ""
            else:
                normalized["rating"] = ""
                normalized["number_of_rates"] = ""

        # details doit être une liste
        if not isinstance(normalized.get("details", []), list):
            normalized["details"] = []

        # Construction de l'ordre des clés, avec url en 2e si présente
        keys_order = ["name"]
        if "url" in normalized:
            keys_order.append("url")
        keys_order.extend(
            [k for k in self.MANDATORY_KEYS if k != "name" and k != "details"]
        )
        keys_order.append("details")

        result = {key: normalized.get(key, "") for key in keys_order}

        return result

    def normalize_products(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self.normalize_product(p) for p in products]

    def run(self):
        with open(self.input_path, encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, list):
            raise ValueError("Erreur : le JSON racine doit être une liste de produits.")

        normalized = self.normalize_products(data)

        if self.output_path:
            with open(self.output_path, "w", encoding="utf-8") as f:
                json.dump(normalized, f, ensure_ascii=False, indent=2)
            print(f"Fichier normalisé écrit : {self.output_path}")
        else:
            print(json.dumps(normalized, ensure_ascii=False, indent=2))
