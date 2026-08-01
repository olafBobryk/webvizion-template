# Feedback and Status

Choose feedback by ownership and lifetime, not by color.

| Situation | Owner class |
| --- | --- |
| One invalid value | Complete input and Field |
| User-triggered async progress or outcome | Toast system |
| Blocking decision | Confirmation modal |
| Initial loading | Skeleton or inline loading state |
| Empty, unavailable, or recoverable region | State family |
| Persistent context independent of the latest action | StatusMessage |
| Durable post-success instructions | Replacement content |

- Do not toast initial loading or field validation.
- Do not use a semantic notice as a generic mutation-result banner.
- Do not repeat identical feedback through multiple channels.
- Persistent context may coexist with action feedback only when the messages
  have different ownership and meaning.

Storybook defines each owner's supported tones, presence behavior, callbacks,
and accessibility guarantees.
