# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - img [ref=e4]
      - generic [ref=e7]: CryptoTrader
    - generic [ref=e8]:
      - generic [ref=e9]:
        - heading "Connexion" [level=1] [ref=e10]
        - paragraph [ref=e11]: Entrez vos identifiants pour accéder à votre compte
      - generic [ref=e12]:
        - generic [ref=e13]: Erreur de connexion
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]: Email
            - textbox "Email" [ref=e17]:
              - /placeholder: email@example.com
              - text: titi@gmail.com
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]: Mot de passe
              - link "Mot de passe oublié ?" [ref=e21] [cursor=pointer]:
                - /url: /forgot-password
            - textbox "Mot de passe" [ref=e22]: titi@gmail.com
          - button "Se connecter" [ref=e23]
        - generic [ref=e24]:
          - text: Pas encore de compte ?
          - link "S'inscrire" [ref=e25] [cursor=pointer]:
            - /url: /register
  - alert [ref=e26]
```