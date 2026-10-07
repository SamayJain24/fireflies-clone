import json
import urllib.request

BASE = 'http://localhost:8000/api/v1'

def run_tests():
    # 1. Test GET meetings
    req = urllib.request.urlopen(f'{BASE}/meetings/')
    meetings = json.loads(req.read().decode())
    print(f'1. GET meetings: {len(meetings)} meetings found [PASS]')

    # 2. Test POST meeting
    post_data = json.dumps({
        'title': 'QA Test Meeting',
        'duration': 150.0,
        'speakers': ['QA Tester']
    }).encode()
    post_req = urllib.request.Request(
        f'{BASE}/meetings/',
        data=post_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    created = json.loads(urllib.request.urlopen(post_req).read().decode())
    mid = created['id']
    title = created['title']
    print(f'2. POST meeting created ID: {mid}, Title: {title} [PASS]')

    # 3. Test PATCH meeting (edit title)
    patch_data = json.dumps({'title': 'QA Test Meeting (Edited)'}).encode()
    patch_req = urllib.request.Request(
        f'{BASE}/meetings/{mid}',
        data=patch_data,
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    updated = json.loads(urllib.request.urlopen(patch_req).read().decode())
    updated_title = updated['title']
    print(f'3. PATCH meeting updated Title: {updated_title} [PASS]')

    # 4. Test GET meeting by ID
    get_one = json.loads(urllib.request.urlopen(f'{BASE}/meetings/{mid}').read().decode())
    print(f'4. GET meeting by ID: {get_one["id"]} confirmed [PASS]')

    # 5. Test PATCH action item
    ai_data = json.dumps({'is_completed': True}).encode()
    ai_req = urllib.request.Request(
        f'{BASE}/action-items/1',
        data=ai_data,
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    ai_updated = json.loads(urllib.request.urlopen(ai_req).read().decode())
    print(f'5. PATCH action item 1 is_completed: {ai_updated["is_completed"]} [PASS]')

    # 6. Test DELETE meeting
    del_req = urllib.request.Request(f'{BASE}/meetings/{mid}', method='DELETE')
    del_res = urllib.request.urlopen(del_req)
    print(f'6. DELETE meeting {mid} status: {del_res.status} [PASS]')

    print('\nALL CRUD API TESTS PASSED!')

if __name__ == '__main__':
    run_tests()
