# Is the manifest meaningfully different? Ignore a legacy `.generated` field.
($existing[0] // {} | del(.generated)) != ($manifest[0] // {} | del(.generated))
