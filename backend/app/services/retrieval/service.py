from typing import List, Dict, Any

class RetrievalService:
    """
    Modular RAG retrieval service for civic rights, RTI regulations, and government schemes.
    """
    def __init__(self):
        self.knowledge_base = [
            {
                "id": "consumer_01",
                "title": "Consumer Protection Act 2019",
                "category": "consumer",
                "content": "Rights to safety, information, choice, redressal, and consumer education regarding defective goods or deficiency of services."
            },
            {
                "id": "rti_01",
                "title": "Right to Information Act 2005",
                "category": "rti",
                "content": "Empowers citizens to request information from public authorities, mandating responses within 30 days."
            }
        ]

    def search_rights(self, query: str, category: str = None) -> List[Dict[str, Any]]:
        results = []
        for item in self.knowledge_base:
            if category and item["category"].lower() != category.lower():
                continue
            if not query or query.lower() in item["content"].lower() or query.lower() in item["title"].lower():
                results.append(item)
        return results if results else self.knowledge_base
