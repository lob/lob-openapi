
SPEC_FILE ?= Lob-API-public

.PHONY: bundle
bundle:
	npx @redocly/openapi-cli bundle -o dist/$(SPEC_FILE)-bundled.yml $(SPEC_FILE).yml
