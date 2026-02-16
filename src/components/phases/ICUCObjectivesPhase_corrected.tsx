// This is a temporary file to show the corrected deliverables section
// The PSC and SITL pills should be placed between the deliverable title and the expand button like this:

/*
<div className="flex items-center gap-3 mb-2">
  <Checkbox
    checked={deliverables[deliverable.id] || false}
    onCheckedChange={(checked) => handleDeliverableChange(deliverable.id, checked as boolean)}
    className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
  />
  <IconComponent className={`w-4 h-4 ${deliverable.color} flex-shrink-0`} />
  <div className="flex-1 min-w-0">
    <h4 className="text-sm text-foreground">{deliverable.text}</h4>
  </div>
  <div className="flex items-center gap-2">
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">
      PSC
    </span>
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
      SITL
    </span>
  </div>
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleDeliverableExpand(deliverable.id)}
    className="p-1 h-auto text-foreground hover:text-accent-foreground"
  >
    {expandedDeliverables[deliverable.id] ? (
      <ChevronDown className="w-4 h-4" />
    ) : (
      <ChevronRight className="w-4 h-4" />
    )}
  </Button>
</div>
*/