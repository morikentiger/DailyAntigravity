on run argv
    set promptText to item 1 of argv

    -- Target application: Try Electron (Antigravity) first, then Chrome
    set targetApp to ""
    set appActivatedSuccessfully to false

    tell application "System Events"
        if exists process "Electron" then
            set targetApp to "Electron"
        else if exists process "Google Chrome" then
            set targetApp to "Google Chrome"
        end if
    end tell

    if targetApp is "Electron" then
        tell application "Electron"
            activate
            delay 0.5
            set appActivatedSuccessfully to true
        end tell
    else if targetApp is "Google Chrome" then
        tell application "Google Chrome"
            activate
            delay 0.5

            -- Try to find the tab with "Daily Antigravity" or similar
            set foundTab to false
            set windowList to every window
            repeat with w in windowList
                set tabList to every tab of w
                repeat with t in tabList
                    if title of t contains "DailyAntigravity" or title of t contains "Antigravity" then
                        set active tab index of w to (id of t)
                        set index of w to 1
                        set foundTab to true
                        exit repeat
                    end if
                end repeat
                if foundTab then exit repeat
            end repeat
            set appActivatedSuccessfully to foundTab
        end tell
    end if

    if appActivatedSuccessfully then
        delay 1
        tell application "System Events"
            -- Focus the chat input (Assuming it's ready or requires a click/tab)
            -- For standard web apps, sometimes Tab keys or just typing works if focus is maintained
            -- Here we just simulate typing and Enter
            keystroke promptText
            delay 0.1
            key code 36 -- Return/Enter key
        end tell
    else
        return "Target tab not found."
    end if
end run
